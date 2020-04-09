const mongoose = require('mongoose');
const BetaTests = require('../models/betaTests');
const BetaTestParticipations = require('../models/betaTestParticipations');
const BetaTestMissions = require('../models/betaTestMissions');
const AwardRecords = require('../models/awardRecords');
const ConfigurationsService = require('../services/configurations');

const getAllBetaTestsCount = () => {
    return BetaTests.count({ status: { $ne: "test" }});
};

const getAllRewards = () => {
    return AwardRecords.aggregate([
        { $match: { price : { $exists: true } } },
        {
            $group: {
                _id: { betaTestId : '$betaTestId', rewardOrder : '$rewardOrder' },
                price: { $first: '$price' },
                userCount: { $sum: 1 }
            }
        }
    ]);
};

const getCompletedUsersCountFromAllMissionItem = () => {
    return BetaTests.aggregate([
        { $match: { status: { $ne: "test" } } },
        { $project: { missions: 1 } },
        { $unwind: "$missions" },
        { $unwind: "$missions.items" },
        { $replaceRoot: { newRoot : "$missions.items" } },
        { $project: { _id: 0, "completedUsersCount" : { $size : "$completedUserIds" } } }
    ]);
};

const findValidBetaTests = (userId) => {
    const currentTime = new Date();

    console.log('findValidBetaTests userId=', userId);
    return BetaTests.aggregate([
        {
            $match : {
                openDate: {$lte: currentTime},
                closeDate: {$gte: currentTime},
                $or: [
                    {targetUserIds: {$exists: false}},
                    {targetUserIds: {$in: [userId]}},
                ],
            }
        },
        {
            $group: {
                _id: "$_id",
                coverImageUrl: { $first: "$coverImageUrl" },
                title: { $first: "$title" },
                description: { $first: "$description" },
                plan: { $first: "$plan" },
                status: { $first: "$status" },
                progressText: { $first: "$progressText" },
                tags: { $first: "$tags" },
                openDate: { $first: "$openDate" },
                closeDate: { $first: "$closeDate" },
                bugReport: { $first: "$bugReport" },
            }
        }
    ]).then(async betaTests => {
        const currentDate = new Date();

        const adminUserIds = await ConfigurationsService.getAdminUserIds();
        if (!adminUserIds.includes(userId)) {
            betaTests = betaTests.filter(betaTest => betaTest.status !== "test");
        }

        const defaultProgressText = await ConfigurationsService.getBetaTestProgressText();

        // completed 처리 용도라 처리방법 변경되면 사라질 수 있음
        const totalMissionCounts = await BetaTestMissions.aggregate([
            { $match : { betaTestId: { $in : betaTests.map(betaTest => betaTest._id) } } },
            {
                $group: {
                    _id: "$betaTestId",
                    totalItemCount: {$sum: 1}
                }
            }
        ]);

        const completedMissionCounts = await BetaTestParticipations.aggregate([
            { $match : { userId: userId, betaTestId: { $in : betaTests.map(betaTest => betaTest._id) } } },
            {
                $group : {
                    _id: "$betaTestId",
                    completedItemCount: {$sum : 1}
                }
            }
        ]);

        return betaTests.map(betaTest => {
            betaTest.currentDate = currentDate;
            betaTest.progressText = (betaTest.progressText)? betaTest.progressText : defaultProgressText;

            // 임시코드
            const betaTestWithCompletedMissionCount = completedMissionCounts.filter(completedItemCount => String(completedItemCount._id) === String(betaTest._id));
            const participationCount = betaTestWithCompletedMissionCount.length > 0 ? betaTestWithCompletedMissionCount[0].completedItemCount : 0;

            betaTest.isAttended = participationCount > 0;
            betaTest.totalItemCount = totalMissionCounts.filter(totalItemCount => String(totalItemCount._id) === String(betaTest._id))[0].totalItemCount;
            betaTest.completedItemCount = betaTest.isAttended ? participationCount - 1 : 0;

            return betaTest;
        })
    });
};

const findFinishedBetaTests = (userId) => {
    const currentTime = new Date();

    return BetaTests.aggregate([
        {
            $match : {
                closeDate: { $lte: currentTime },
                $or: [
                    { targetUserIds: { $exists: false }},
                    { targetUserIds: { $in: [ userId ] } },
                ],
            }
        },
        {
            $group: {
                _id: "$_id",
                iconImageUrl: { $first: "$iconImageUrl" },
                title: { $first: "$title" },
                description: { $first: "$description" },
                tags: { $first: "$tags" },
                openDate: { $first: "$openDate" },
                closeDate: { $first: "$closeDate" },
                epilogue: { $first: "$epilogue" },
            }
        }
    ]).then(async betaTests => {
        const currentDate = new Date();
        return await Promise.all(
            betaTests.map(async betaTest => {
                betaTest.currentDate = currentDate;

                const participations = await findBetaTestParticipation(betaTest._id, userId);
                betaTest.isAttended = participations.length > 0;

                const missions = await findBetaTestMissions(betaTest._id);
                betaTest.missions = convertMissionItemsForClient(userId, missions, participations)
                    .map(mission => {
                        return {

                            title: mission.title,
                            actionType: mission.actionType,
                            action: mission.action,
                            isRecheckable: mission.isRecheckable,
                            isCompleted: mission.isCompleted,
                        }
                    });

                betaTest.totalItemCount = betaTest.missions.length;
                betaTest.completedItemCount = betaTest.missions.filter(mission => mission.isCompleted).length;
                betaTest.missions = betaTest.missions.filter(mission => mission.isRecheckable && mission.isCompleted);

                return betaTest;
            })
        );
    });
};

const convertMissionItemsForClient = (userId, missions, participations) => {
    const completedMissionIds = participations.filter(participation => participation.missionId)
                                            .map(participation => participation.missionId.toString());

    return missions.map(mission => {
        mission.isCompleted = completedMissionIds.includes(mission._id.toString());

        if (mission.options) {
            mission.isRepeatable = mission.options.includes('repeatable');
            mission.isMandatory = mission.options.includes('mandatory');
            mission.isRecheckable = mission.options.includes('recheckable');
            delete mission.options;
        }

        return mission;
    });
};

const findBetaTest = (betaTestId, userId) => {
    return BetaTests.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId(betaTestId) }
        },
        {
            $group:  {
                _id: "$_id",
                title: { $first: "$title" },
                description: { $first: "$description" },
                purpose: { $first: "$purpose" },
                tags: { $first: "$tags" },
                coverImageUrl: { $first: "$coverImageUrl" },
                iconImageUrl: { $first: "$iconImageUrl" },
                openDate: { $first: "$openDate" },
                closeDate: { $first: "$closeDate" },
                rewards: { $first: "$rewards" },
            }
        }
        ])
        .then(async betaTests => {
            console.log(betaTests);
            const betaTest = betaTests[0];

            const participations = await findBetaTestParticipation(betaTest._id, userId);
            betaTest.isAttended = participations.length > 0;

            const missions = await findBetaTestMissions(betaTest._id);
            betaTest.missions = convertMissionItemsForClient(userId, missions, participations);
            betaTest.currentDate = new Date();

            console.log(betaTest)

            return betaTest;
        });
};

// 이거 카운드말고 그냥 미션들을 싹 보내줄까... (missionId, isCompleted 조합 리스트로..)
const findBetaTestProgress = async (betaTestId, userId) => {
    const missionItems = await findBetaTestMissions(betaTestId);
    const userParticipations = await findBetaTestParticipation(betaTestId, userId);

    return Promise.all([missionItems, userParticipations]).then(values => {
        const missionItems = values[0];
        const userParticipations = values[1];
        const userParticipatedMissionIds = userParticipations.map(participation => String(participation.missionId));

        return {
            isAttended: userParticipations.length > 0,
            missionItems: missionItems.map(mission => {
                const isCompleted = userParticipatedMissionIds.includes(String(mission._id));

                return {
                    _id: mission._id,
                    isCompleted: isCompleted,
                }
            })
        }
    })
};

const findMissionItemsProgress = (missionId, userId) => {
    return BetaTests.aggregate([
        {
            $unwind: "$missions"
        }, {
            $match: { "missions._id": mongoose.Types.ObjectId(missionId) }
        }, {
            $project: {
                _id: "$missions._id",
                items: "$missions.items"
            }
        }, {
            $unwind: "$items"
        }, {
            $project: {
                _id: "$items._id",
                isCompleted: { $in : [userId, "$items.completedUserIds"] },
            }
        }
    ]);
};

const concat = (x,y) =>
    x.concat(y);

const flatMap = (f,xs) =>
    xs.map(f).reduce(concat, []);

Array.prototype.flatMap = function(f) {
    return flatMap(f,this)
};

// 이거 에러 그룹에 묶고싶다..
class NotAttendedError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class AlreadyExistError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

const findAttendParticipation = (betaTestId, userId) => {
    return BetaTestParticipations.findOne({
        betaTestId: betaTestId,
        userId: userId,
        missionId: {$exists: false}
    }).lean();
};

const findMissionParticipation = (betaTestId, missionId, userId) => {
    return BetaTestParticipations.findOne({
        betaTestId: betaTestId,
        missionId: missionId,
        userId: userId,
    }).lean();
};

const findBetaTestParticipation = (betaTestId, userId) => {
    return BetaTestParticipations.find({
        userId: userId,
        betaTestId: betaTestId
    }).lean();
};

const findBetaTestMissions = (betaTestId) => {
    return BetaTestMissions.find({
        betaTestId: betaTestId,
    }).lean();
};

const getBetaTestMissionCount = (betaTestId, userId) => {
    return BetaTestMissions.count({
        betaTestId: betaTestId,
    })
};

const attend = (betaTestId, userId) => {
    return findAttendParticipation(betaTestId, userId).then(participation => {
        if (participation) {
            throw new AlreadyExistError();
        }

        return new BetaTestParticipations({
            userId: userId,
            betaTestId: betaTestId,
            date: new Date(),
        }).save();
    }).then(participation => {
        console.log("[", userId, "] attend (participation:", participation, ")");
        return participation;
    });
};

const updateMissionCompleted = (betaTestId, missionId, userId) => {
    return BetaTestParticipations.findOne({
        userId: userId,
        betaTestId: betaTestId,
        missionId: {$exists: false}
    }).then(participation => {
        if (!participation) {
            throw new NotAttendedError();
        }

        return BetaTestParticipations.findOne({userId: userId, betaTestId: betaTestId, missionId: missionId})
    }).then(participation => {
        if (participation) {
            throw new AlreadyExistError();
        }

        return new BetaTestParticipations({
            userId: userId,
            betaTestId: betaTestId,
            date: new Date(),
            missionId: missionId,
        }).save();
    }).then(participation => {
        console.log("[", userId, "] updateMissionCompleted (participation:", participation, ")");
        return participation;
    });
};

const updateCompleted = (betaTestId, userId) => {
    return BetaTests.findOneAndUpdate(
        {
            "missions.items": {$elemMatch: {_id: mongoose.Types.ObjectId(betaTestId), completedUserIds: {$nin: [userId]}}}
        },
        { $push: {"missions.$.items.$[item].completedUserIds": userId}},
        {
            arrayFilters: [
                {"item._id": {$eq: mongoose.Types.ObjectId(betaTestId)}}
            ]
        }).then(betaTest => {
            console.log("[", userId, "] updateCompleted", betaTest);
            return betaTest;
        });
};

const addTargetUserId = (betaTestIds, userId) => {
    const bulkOps = [];

    betaTestIds.forEach(betaTestId => {
        bulkOps.push({
            'updateOne': {
                filter: {
                    id: betaTestId,
                    targetUserIds: {$nin: [userId]}
                },
                update: {$push: {targetUserIds: userId}}
            }
        });
    });

    return BetaTests.bulkWrite(bulkOps);
};

module.exports = {
    getAllBetaTestsCount,
    getAllRewards,
    getCompletedUsersCountFromAllMissionItem,
    findValidBetaTests,
    findFinishedBetaTests,
    findBetaTestProgress,
    findBetaTest,
    findMissionParticipation,
    findMissionItemsProgress,
    attend,
    updateMissionCompleted,
    updateCompleted,
    addTargetUserId,

    AlreadyExistError,
    NotAttendedError
};
