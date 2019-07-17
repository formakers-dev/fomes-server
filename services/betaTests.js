const mongoose = require('mongoose');
const BetaTests = require('../models/betaTests');

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
            return betaTest;
        })
    });
};

const findBetaTest = (betaTestId, userId) => {
    return BetaTests.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId(betaTestId) }
        },
        {
            $project : {
                _id: true,
                title: true,
                description: true,
                purpose: true,
                tags: true,
                overviewImageUrl: true,
                iconImageUrl: true,
                openDate: true,
                closeDate: true,
                rewards: true,
                missions: true,
            }
        }
        ])
        .then(betaTests => {
            console.log(betaTests);
            const betaTest = betaTests[0];

            betaTest.missions = betaTest.missions.map(mission => {
                mission.items =  mission.items.map(item => {
                    item.isCompleted = item.completedUserIds.includes(userId);
                    delete item.completedUserIds;
                    return item;
                });
                return mission;
            });

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
    findValidBetaTests,
    findFinishedBetaTests,
    findBetaTestProgress,
    findBetaTest,
    findMissionItemsProgress,
    updateCompleted,
    addTargetUserId,
};
