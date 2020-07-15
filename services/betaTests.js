const mongoose = require('mongoose');
const BetaTests = require('../models/betaTests');
const BetaTestParticipations = require('../models/betaTestParticipations');
const BetaTestMissions = require('../models/betaTestMissions');
const AwardRecords = require('../models/awardRecords').AwardRecords;
const ConfigurationsService = require('../services/configurations');

const getAllBetaTestsCount = () => {
    return BetaTests.count({status: {$ne: "test"}});
};

const getAllRewards = () => {
    return AwardRecords.aggregate([
        {$match: {'reward.price': {$exists: true}}},
        {
            $group: {
                _id: {betaTestId: '$betaTestId', type: '$type', typeCode: '$typeCode'},
                price: {$first: '$reward.price'},
                userCount: {$sum: 1}
            }
        }
    ]);
};

const getCompletedUsersCountFromAllMissionItem = () => {
    return BetaTests.aggregate([
        {$match: {status: {$ne: "test"}}},
        {$project: {missions: 1}},
        {$unwind: "$missions"},
        {$unwind: "$missions.items"},
        {$replaceRoot: {newRoot: "$missions.items"}},
        {$project: {_id: 0, "completedUsersCount": {$size: "$completedUserIds"}}}
    ]);
};

const findValidBetaTests = (userId) => {
    const currentTime = new Date();

    console.log('findValidBetaTests userId=', userId);
    return BetaTests.aggregate([
        {
            $match: {
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
                coverImageUrl: {$first: "$coverImageUrl"},
                title: {$first: "$title"},
                description: {$first: "$description"},
                plan: {$first: "$plan"},
                status: {$first: "$status"},
                progressText: {$first: "$progressText"},
                tags: {$first: "$tags"},
                openDate: {$first: "$openDate"},
                closeDate: {$first: "$closeDate"},
                bugReport: {$first: "$bugReport"},
                missionsSummary: {$first: "$missionsSummary"},
            }
        }
    ]).then(async betaTests => {
        const currentDate = new Date();

        const adminUserIds = await ConfigurationsService.getAdminUserIds();
        if (!adminUserIds.includes(userId)) {
            betaTests = betaTests.filter(betaTest => betaTest.status !== "test");
        }

        const defaultProgressText = await ConfigurationsService.getBetaTestProgressText();

        const participations = await BetaTestParticipations.Model.find({
            userId: userId,
            betaTestId: {$in: betaTests.map(betaTest => betaTest._id)},
            type: BetaTestParticipations.Constants.TYPE_BETA_TEST
        }).lean();

        return betaTests.map(betaTest => {
            betaTest.currentDate = currentDate;
            betaTest.progressText = (betaTest.progressText) ? betaTest.progressText : defaultProgressText;

            betaTest.isAttended = isAttendedBetaTest(userId, betaTest._id, participations);
            betaTest.isCompleted = isCompletedBetaTest(userId, betaTest._id, participations);

            // TODO : v0.3.0 크리티컬릴리즈 시 오류 방지 위한 임시 코드 - 릴리즈 후 추후 삭제 필요
            betaTest.completedItemCount = 1;
            betaTest.totalItemCount = 1;

            return betaTest;
        })
    });
};

const findFinishedBetaTests = (userId, isVerbose) => {
    console.log("[findFinishedBetaTests] userId=", userId, ", isVerbose=", isVerbose);
    const currentTime = new Date();

    return BetaTests.find(
        {
            $and: [
                {closeDate: {$lte: currentTime}},
                {
                    $or: [
                        {targetUserIds: {$exists: false}},
                        {targetUserIds: {$in: [userId]}},
                    ]
                }
            ],
        },
        {
            _id: 1,
            coverImageUrl: 1,
            iconImageUrl: 1,
            title: 1,
            description: 1,
            tags: 1,
            openDate: 1,
            closeDate: 1,
            epilogue: 1,
            plan: 1,
            rewards: 1,
            missionsSummary: 1,
        }
    ).lean().then(async betaTests => {
        const currentDate = new Date();

        return await Promise.all(
            betaTests.map(async betaTest => {
                betaTest.currentDate = currentDate;

                betaTest.isRegisteredEpilogue = !!betaTest.epilogue;
                // betaTest.isRegisteredAwards = await findAwardRecordsIsExist(betaTest._id);

                // TODO : 별도 API로 분리해서 가져오는게 좋을 것 같긴한데... 고민된당
                const participations = await findBetaTestParticipation(betaTest._id, userId);
                betaTest.isCompleted = isCompletedBetaTest(userId, betaTest._id, participations);

                return betaTest;
            })
        );
    });
};

const convertMissionItemsForClient = (userId, missions, participations) => {
    const completedMissionIds = participations.filter(participation => participation.type === BetaTestParticipations.Constants.TYPE_MISSION)
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
            $match: {_id: mongoose.Types.ObjectId(betaTestId)}
        },
        {
            $group: {
                _id: "$_id",
                title: {$first: "$title"},
                description: {$first: "$description"},
                purpose: {$first: "$purpose"},
                tags: {$first: "$tags"},
                coverImageUrl: {$first: "$coverImageUrl"},
                iconImageUrl: {$first: "$iconImageUrl"},
                openDate: {$first: "$openDate"},
                closeDate: {$first: "$closeDate"},
                rewards: {$first: "$rewards"},
                missionsSummary: {$first: "$missionsSummary"},
                plan: {$first: "$plan"},
            }
        }
    ])
        .then(async betaTests => {
            const betaTest = betaTests[0];

            const participations = await findBetaTestParticipation(betaTest._id, userId);
            betaTest.isAttended = isAttendedBetaTest(userId, betaTest._id, participations);
            betaTest.isCompleted = isCompletedBetaTest(userId, betaTest._id, participations);

            // TODO : v0.3.0 크리티컬릴리즈 시 오류 방지 위한 임시 코드 - 릴리즈 후 추후 삭제 필요
            betaTest.completedItemCount = 1;
            betaTest.totalItemCount = 1;

            const missions = await findBetaTestMissions(betaTest._id);
            betaTest.missions = convertMissionItemsForClient(userId, missions, participations);
            betaTest.currentDate = new Date();

            return betaTest;
        });
};

// 이거 카운드말고 그냥 미션들을 싹 보내줄까... (missionId, isCompleted 조합 리스트로..)
const findBetaTestProgress = async (betaTestId, userId, isVerbose) => {
    const userParticipations = await findBetaTestParticipation(betaTestId, userId);

    const result = {
        isAttended: isAttendedBetaTest(userId, betaTestId, userParticipations),
        isCompleted: isCompletedBetaTest(userId, betaTestId, userParticipations),

        // TODO : v0.3.0 크리티컬릴리즈 시 오류 방지 위한 임시 코드 - 릴리즈 후 추후 삭제 필요
        completedItemCount: 1,
        totalItemCount: 1
    };

    if (isVerbose) {
        const userParticipatedMissionIds = userParticipations.map(participation => String(participation.missionId));
        const missionItems = await findBetaTestMissions(betaTestId);

        result.missionItems = missionItems.map(mission => {
            const isCompleted = userParticipatedMissionIds.includes(String(mission._id));

            return {
                _id: mission._id,
                isCompleted: isCompleted,
            }
        })
    }

    return result;
};

const findAwardRecords = (betaTestId) => {
    return AwardRecords.find({betaTestId: betaTestId},
        {
            userId: 1,
            nickName: 1,
            type: 1,
            typeCode: 1,
            reward: 1
        }).sort({ typeCode: -1 }).lean();
};

const findAwardRecordsIsExist = async (betaTestId) => {
    const count = await AwardRecords.count({betaTestId: betaTestId}).limit(1);
    return count > 0;
};

const findEpilogue = (betaTestId) => {
    return BetaTests.findOne({_id: betaTestId},
        {
            epilogue: 1,
        }
    ).then(betaTest => {
        return betaTest.epilogue;
    })
};

const findCompletedMissions = (betaTestId, userId) => {
    return BetaTestParticipations.Model.find({
        betaTestId: betaTestId,
        userId: userId,
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    }).lean().then(participations => {
        return BetaTestMissions.find({
            betaTestId: betaTestId,
            _id: { $in: participations.map(participation => participation.missionId) }
        }).lean()
    })
};

const findCompletedBetaTestCount = (userId) => {
    return BetaTestParticipations.Model.count({
        userId: userId,
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    });
};

const concat = (x, y) =>
    x.concat(y);

const flatMap = (f, xs) =>
    xs.map(f).reduce(concat, []);

Array.prototype.flatMap = function (f) {
    return flatMap(f, this)
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
    return BetaTestParticipations.Model.findOne({
        betaTestId: betaTestId,
        userId: userId,
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_ATTEND,
        missionId: {$exists: false},
    }).lean();
};

const findMissionParticipation = (betaTestId, missionId, userId) => {
    return BetaTestParticipations.Model.findOne({
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        betaTestId: betaTestId,
        missionId: missionId,
        userId: userId,
    }).lean();
};

const findBetaTestParticipation = (betaTestId, userId) => {
    return BetaTestParticipations.Model.find({
        userId: userId,
        betaTestId: betaTestId
    }).lean();
};

const findBetaTestMissions = (betaTestId) => {
    return BetaTestMissions.find({
        betaTestId: betaTestId,
    }).lean();
};

const isAttendedBetaTest = (userId, betaTestId, participations) => {
    return participations.some(participation =>
        participation.betaTestId.toString() === betaTestId.toString()
        && participation.type === BetaTestParticipations.Constants.TYPE_BETA_TEST
        && participation.status === BetaTestParticipations.Constants.STATUS_ATTEND
    );
};

const isCompletedBetaTest = (userId, betaTestId, participations) => {
    return participations.some(participation =>
        participation.betaTestId.toString() === betaTestId.toString()
        && participation.type === BetaTestParticipations.Constants.TYPE_BETA_TEST
        && participation.status === BetaTestParticipations.Constants.STATUS_COMPLETE
    );
};

const getTotalMissionCount = (betaTestId) => {
    return BetaTestMissions.count({
        betaTestId: betaTestId,
    })
};

const getParticipatedMissionCount = (betaTestId, userId) => {
    return BetaTestParticipations.Model.count({
        userId: userId,
        betaTestId: betaTestId,
        type: BetaTestParticipations.Constants.TYPE_MISSION,
    }).lean();
};

const attend = (betaTestId, userId) => {
    return findAttendParticipation(betaTestId, userId).then(participation => {
        if (participation) {
            throw new AlreadyExistError();
        }

        return new BetaTestParticipations.Model({
            userId: userId,
            betaTestId: betaTestId,
            type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
            status: BetaTestParticipations.Constants.STATUS_ATTEND,
            date: new Date(),
        }).save();
    }).then(participation => {
        console.log("[", userId, "] attend (participation:", participation, ")");
        return participation;
    });
};

const completeMission = (betaTestId, missionId, userId) => {
    const missionParticipation = {
        userId: userId,
        betaTestId: betaTestId,
        missionId: missionId,
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    };

    return findAttendParticipation(betaTestId, userId).then(participation => {
        if (!participation) {
            throw new NotAttendedError();
        }

        return BetaTestParticipations.Model.findOne(missionParticipation);
    }).then(participation => {
        if (participation) {
            throw new AlreadyExistError();
        }

        missionParticipation.date = new Date();

        return new BetaTestParticipations.Model(missionParticipation).save();
    }).then(participation => {
        console.log("[", userId, "] Mission is Completed (participation:", participation, ")");
        return participation;
    });
};

const checkAndCompleteBetaTest = (betaTestId, userId) => {
    return Promise.all([getTotalMissionCount(betaTestId), getParticipatedMissionCount(betaTestId, userId)])
        .then(values => {
            const totalMissionCount = values[0];
            const completedMissionCount = values[1];

            if (completedMissionCount >= totalMissionCount) {
                return completeBetaTest(betaTestId, userId);
            } else {
                return Promise.resolve();
            }
        })
};

const completeBetaTest = (betaTestId, userId) => {
    const betaTestParticipation = {
        userId: userId,
        betaTestId: betaTestId,
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    };

    return findAttendParticipation(betaTestId, userId).then(participation => {
        if (!participation) {
            throw new NotAttendedError();
        }
        return BetaTestParticipations.Model.findOne(betaTestParticipation);
    }).then(participation => {
        if (participation) {
            throw new AlreadyExistError();
        }

        betaTestParticipation.date = new Date();

        return new BetaTestParticipations.Model(betaTestParticipation).save();
    }).then(participation => {
        console.log("[", userId, "] BetaTest is Completed (participation:", participation, ")");
        return participation;
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
    findAwardRecords,
    findEpilogue,
    findCompletedMissions,
    findCompletedBetaTestCount,
    attend,
    completeMission,
    completeBetaTest,
    addTargetUserId,
    checkAndCompleteBetaTest,

    AlreadyExistError,
    NotAttendedError
};
