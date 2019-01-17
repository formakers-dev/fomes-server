const BetaTests = require('../models/betaTests');

const findValidBetaTests = (userId) => {
    const currentTime = new Date();

    return BetaTests.aggregate([
        {
            $match : {
                closeDate: { $gte: currentTime },
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
                actionType: true,
                action: true,
                reward: true,
                isOpened: {
                    $lte: ["$openDate", currentTime]
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