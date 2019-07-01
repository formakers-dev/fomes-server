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
                totalItemCount: {$sum: 1}
            }
        }
    ]);
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
    ]);
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

            return betaTest;
        });
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
            "missions.items._id": mongoose.Types.ObjectId(betaTestId),
            "missions.items.completedUserIds": {$nin: [userId]}
        },
        { $push: {"missions.$.items.$[item].completedUserIds": userId}},
        {
            arrayFilters: [
                {"item._id": {$eq: mongoose.Types.ObjectId(betaTestId)}}
            ]
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
    findBetaTest,
    updateCompleted,
    addTargetUserId,
};
