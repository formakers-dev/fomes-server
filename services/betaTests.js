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

const concat = (x,y) =>
    x.concat(y);

const flatMap = (f,xs) =>
    xs.map(f).reduce(concat, []);

Array.prototype.flatMap = function(f) {
    return flatMap(f,this)
};

const updateCompleted = (betaTestId, userId) => {
    return BetaTests.findOneAndUpdate({
        $and: [
            {id: betaTestId},
            {completedUserIds: {$nin: [userId]}}
        ]
    }, {$push: {completedUserIds: userId}});
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
    updateCompleted,
    addTargetUserId,
};
