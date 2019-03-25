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
                _id: true,
                groupId: true,
                id: true,
                overviewImageUrl: true,
                title: true,
                subTitle: true,
                tags: true,
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
                },
                isGroup: true
            }
        }
    ]).then(betaTests => {
        const closedGroups = betaTests
            .filter(betaTest => betaTest.isGroup && betaTest.closeDate < new Date());
        const shownItems = betaTests.filter(betaTest => betaTest.groupId)
            .filter(betaTest => {
                const closedGroupIds = closedGroups.map(group => group._id.toString());
                return !closedGroupIds.includes(betaTest.groupId.toString())
            });

        return Promise.resolve(shownItems.concat(closedGroups));
    });
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
