const mongoose = require('mongoose');
const BetaTests = require('../models/betaTests');

const getAllBetaTestsCount = () => {
    return BetaTests.count({});
};

const getAllRewards = () => {
    return BetaTests.aggregate([
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
        { $project : { missions: 1 } },
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
                ]
            }
        },
        { $unwind: "$missions" },
        { $unwind: "$missions.items" },
        {
            $group: {
                _id: "$_id",
                overviewImageUrl: { $first: "$overviewImageUrl" },
                title: { $first: "$title" },
                description: { $first: "$description" },
                type: { $first: "$type" },
                progressText: { $first: "$progressText" },
                tags: { $first: "$tags" },
                openDate: { $first: "$openDate" },
                closeDate: { $first: "$closeDate" },
                bugReport: { $first: "$bugReport" },
                completedItemCount: { $sum: {
                        $cond: [
                            { $setIsSubset:
                                    [ [userId], "$missions.items.completedUserIds"]
                            }, 1, 0 ]
                    }
                },
                totalItemCount: {$sum: 1},

            }
        }
    ]).then(betaTests => {
        const currentDate = new Date();
        return betaTests.map(betaTest => {
            betaTest.currentDate = currentDate;

            /* 하위 버전 호환을 위한 필드들 */
            betaTest.groupId = 1;
            betaTest.id = 1;
            betaTest.subTitle = '이것은 서브타이틀';
            betaTest.actionType = 'link';
            betaTest.action = 'http://www.naver.com/';
            betaTest.reward = '포메스의 사랑';
            betaTest.requiredTime = 60000;
            betaTest.amount = '1문';
            betaTest.apps = [];
            betaTest.isOpened = false;
            betaTest.isCompleted = false;
            betaTest.isGroup = true;
            betaTest.afterService = {
                "awards" : "테스트 영웅 : 드래군핥짝 님\n테스트 요정 : 이브 외 9명",
                "epilogue" : "http://www.naver.com",
                "companySays" : "포메스 짱! 완전 짱! 대박! 완전! 완전!"
            };
            if (!betaTest.tags || betaTest.tags.length <= 0) {
                betaTest.tags = ['테스트'];
            }

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
                completedItemCount: { $sum: {
                        $cond: [
                            { $setIsSubset:
                                    [ [userId], "$missions.items.completedUserIds"]
                            }, 1, 0 ]
                    }
                },
                totalItemCount: {$sum: 1}
            }
        }
    ]).then(betaTests => {
        const currentDate = new Date();
        return betaTests.map(betaTest => {
            betaTest.currentDate = currentDate;
            betaTest.missions = convertMissionItemsForClient(userId, betaTest.missions)
                .filter(mission => mission.item.isRecheckable && mission.item.isCompleted)
                .map(mission => {
                    return {
                        item : {
                            title: mission.item.title,
                            actionType: mission.item.actionType,
                            action: mission.item.action,
                            isRecheckable: mission.item.isRecheckable,
                            isCompleted: mission.item.isCompleted,
                        }
                    }
                });

            if(betaTest.missions[0]) {
                console.log(betaTest.missions[0].item);
            }
            return betaTest;
        })
    });
};

const convertMissionItemsForClient = (userId, missions) => {
    return missions.map(mission => {
        mission.item = mission.items;
        delete mission.items;

        mission.item.isCompleted = mission.item.completedUserIds.includes(userId);
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
                iconImageUrl: { $first: "$iconImageUrl" },
                openDate: { $first: "$openDate" },
                closeDate: { $first: "$closeDate" },
                rewards: { $first: "$rewards" },
                missions: { $push: "$missions" },
            }
        }
        ])
        .then(betaTests => {
            console.log(betaTests);
            const betaTest = betaTests[0];

            betaTest.missions = convertMissionItemsForClient(userId, betaTest.missions);
            betaTest.currentDate = new Date();

            return betaTest;
        });
};

const findBetaTestProgress = (betaTestId, userId) => {
    return BetaTests.aggregate([
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
            $group: {
                _id: "$_id",
                completedItemCount: { $sum: {
                        $cond: [
                            { $setIsSubset:
                                    [ [userId], "$missions.items.completedUserIds"]
                            }, 1, 0 ]
                    }
                },
                totalItemCount: {$sum: 1}
            }
        }
    ])
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
    findMissionItemsProgress,
    updateCompleted,
    addTargetUserId,
};
