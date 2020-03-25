const mongoose = require('mongoose');
const BetaTests = require('../models/betaTests');
const BetaTestParticipations = require('../models/betaTestParticipations');
const ConfigurationsService = require('../services/configurations');

const getAllBetaTestsCount = () => {
    return BetaTests.count({ status: { $ne: "test" }});
};

const getAllRewards = () => {
    return BetaTests.aggregate([
        { $match: { status: { $ne: "test" } } },
        { $project: { "rewards" : 1 } },
        { $unwind: "$rewards.list" },
        { $replaceRoot: { newRoot : "$rewards.list" } },
        { $match: { price : { $exists: true } } },
        {
            $project: {
                "price" : 1,
                "userCount" : { $size : "$userIds" }
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
        { $unwind: "$missions" },
        { $unwind: "$missions.items" },
        {
            $group: {
                _id: "$_id",
                overviewImageUrl: { $first: "$overviewImageUrl" },
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
                totalItemCount: {$sum: 1},

            }
        }
    ]).then(async betaTests => {
        const currentDate = new Date();

        const adminUserIds = await ConfigurationsService.getAdminUserIds();
        if (!adminUserIds.includes(userId)) {
            betaTests = betaTests.filter(betaTest => betaTest.status !== "test");
        }

        const defaultProgressText = await ConfigurationsService.getBetaTestProgressText();

        const completedItemCounts = await BetaTestParticipations.aggregate([
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
            const betaTestWithCompletedItemCount = completedItemCounts.filter(completedItemCount => String(completedItemCount._id) === String(betaTest._id));
            betaTest.completedItemCount = betaTestWithCompletedItemCount.length > 0 ? betaTestWithCompletedItemCount[0].completedItemCount : 0;

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
        { $unwind: "$missions" },
        { $unwind: "$missions.items" },
        {
            $group: {
                _id: "$_id",
                iconImageUrl: { $first: "$iconImageUrl" },
                title: { $first: "$title" },
                description: { $first: "$description" },
                tags: { $first: "$tags" },
                openDate: { $first: "$openDate" },
                closeDate: { $first: "$closeDate" },
                afterService: { $first: "$afterService" },
                missions: { $push: "$missions" },
                totalItemCount: {$sum: 1}
            }
        }
    ]).then(async betaTests => {
        const currentDate = new Date();
        return await Promise.all(
            betaTests.map(async betaTest => {
                betaTest.currentDate = currentDate;

                const participations = await findBetaTestParticipation(betaTest._id, userId);
                betaTest.isAttended = participations.length > 0;
                betaTest.missions = convertMissionItemsForClient(userId, betaTest.missions, participations)
                    .map(mission => {
                        return {
                            item: {
                                title: mission.item.title,
                                actionType: mission.item.actionType,
                                action: mission.item.action,
                                isRecheckable: mission.item.isRecheckable,
                                isCompleted: mission.item.isCompleted,
                            }
                        }
                    });

                betaTest.completedItemCount = betaTest.missions.filter(mission => mission.item.isCompleted).length;
                betaTest.missions = betaTest.missions.filter(mission => mission.item.isRecheckable && mission.item.isCompleted);

                return betaTest;
            })
        );
    });
};

const convertMissionItemsForClient = (userId, missions, participations) => {
    const completedMissionIds = participations.filter(participation => participation.missionId)
                                            .map(participation => participation.missionId.toString());

    return missions.map(mission => {
        mission.item = mission.items;
        delete mission.items;

        mission.item.isCompleted = completedMissionIds.includes(mission.item._id.toString());
        delete mission.item.completedUserIds;

        if (mission.item.options) {
            mission.item.isRepeatable = mission.item.options.includes('repeatable');
            mission.item.isMandatory = mission.item.options.includes('mandatory');
            mission.item.isRecheckable = mission.item.options.includes('recheckable');
            delete mission.item.options;
        }

        return mission;
    });
};

const findBetaTest = (betaTestId, userId) => {
    return BetaTests.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId(betaTestId) }
        },
        { $unwind: "$missions" },
        { $unwind: "$missions.items" },
        {
            $group:  {
                _id: "$_id",
                title: { $first: "$title" },
                description: { $first: "$description" },
                purpose: { $first: "$purpose" },
                tags: { $first: "$tags" },
                overviewImageUrl: { $first: "$overviewImageUrl" },
                coverImageUrl: { $first: "$coverImageUrl" },
                iconImageUrl: { $first: "$iconImageUrl" },
                openDate: { $first: "$openDate" },
                closeDate: { $first: "$closeDate" },
                rewards: { $first: "$rewards" },
                missions: { $push: "$missions" },
            }
        }
        ])
        .then(async betaTests => {
            console.log(betaTests);
            const betaTest = betaTests[0];

            const participations = await findBetaTestParticipation(betaTest._id, userId);
            betaTest.isAttended = participations.length > 0;
            betaTest.missions = convertMissionItemsForClient(userId, betaTest.missions, participations);
            betaTest.currentDate = new Date();

            console.log(betaTest)

            return betaTest;
        });
};

// 이거 카운드말고 그냥 미션들을 싹 보내줄까... (missionId, isCompleted 조합 리스트로..)
const findBetaTestProgress = async (betaTestId, userId) => {
    const missionItems = await BetaTests.aggregate([
        {
            $match : {
                _id: mongoose.Types.ObjectId(betaTestId),
                $or: [
                    {targetUserIds: {$exists: false}},
                    {targetUserIds: {$in: [userId]}},
                ]
            }
        },
        { $unwind: "$missions" },
        { $unwind: "$missions.items" },
        {
            $project: {
                missionId: "$missions.items._id"
            }
        }
    ]);

    const userParticipations = await findBetaTestParticipation(betaTestId, userId);

    return Promise.all([missionItems, userParticipations]).then(values => {
        const missionItems = values[0];
        const userParticipations = values[1];
        const userParticipatedMissionIds = userParticipations.map(participation => String(participation.missionId));

        return {
            isAttended: userParticipations.length > 0,
            missionItems: missionItems.map(mission => {
                const isCompleted = userParticipatedMissionIds.includes(String(mission.missionId));

                return {
                    _id: mission.missionId,
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
    });
};

const findMissionParticipation = (betaTestId, missionId, userId) => {
    return BetaTestParticipations.findOne({
        betaTestId: betaTestId,
        missionId: missionId,
        userId: userId,
    });
};

const findBetaTestParticipation = (betaTestId, userId) => {
    return BetaTestParticipations.find({
        userId: userId,
        betaTestId: betaTestId
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
