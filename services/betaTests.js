const BetaTests = require('../models/betaTests');

const findValidBetaTests = (userId) => {
    const currentTime = new Date();

    return BetaTests.aggregate([
        {
            $match : {
                openDate: { $lte: currentTime },
                $or: [
                    { targetUserIds: { $exists: false }},
                    { targetUserIds: { $in: [ userId ] } },
                ]
            }
        }, {
            $project: {
                id: true,
                overviewImageUrl: true,
                title: true,
                subTitle: true,
                type: true,
                typeTags: true,
                openDate: true,
                closeDate: true,
                currentDate: new Date(),
                actionType: true,
                action: true,
                reward: true,
                requiredTime: true,
                amount: true,
                apps: true,
                isOpened: {
                    $and: [
                        {$lte: ["$openDate", currentTime]},
                        {$gte: ["$closeDate", currentTime]}
                    ]
                },
                isCompleted: {
                    $in : [userId, "$completedUserIds"]
                }
            }
        }
    ]);
};

const updateCompleted = (betaTestId, userId) => {
    return BetaTests.findOneAndUpdate({
        $and: [
            {id: betaTestId},
            {completedUserIds: {$nin: [userId]}}
        ]
    }, {$push: {completedUserIds: userId}});
};

module.exports = {
    findValidBetaTests,
    updateCompleted
};