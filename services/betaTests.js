const BetaTests = require('../models/betaTests');

const findValidBetaTests = (userId) => {
    const currentTime = new Date();

    console.log('findValidBetaTests userId=', userId);
    return BetaTests.aggregate([
        {
            $match : {
                openDate: { $lte: currentTime },
                closeDate: { $gte: currentTime },
                $or: [
                    { targetUserIds: { $exists: false }},
                    { targetUserIds: { $in: [ userId ] } },
                ]
            }
        }, {
            $project: {
                _id: true,
                overviewImageUrl: true,
                title: true,
                description: true,
                tags: true,
                openDate: true,
                closeDate: true,
                bugReport: true,
                currentDate: new Date(),
                missions: true,     /// 프로그래스 확인용???
            }
        }
    ]).then(betaTests => {
        console.log(betaTests);
        return betaTests.map(betaTest => {
            betaTest.progressRate = getProgressRate(userId, betaTest);
            return betaTest;
        });
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
        }, {
            $project: {
                _id: true,
                iconImageUrl: true,
                title: true,
                description: true,
                tags: true,
                openDate: true,
                closeDate: true,
                currentDate: new Date(),
                afterService: true,
                missions: true,
            }
        }
    ]).then(finishedBetaTests => {
        console.log(finishedBetaTests);
        return finishedBetaTests.map(betaTest => {
           betaTest.progressRate = getProgressRate(userId, betaTest);
           return betaTest;
        });
    });
};

const getProgressRate = (userId, betaTest) => {
    const items = betaTest.missions.flatMap(mission => mission.items);
    const completedItems = items.filter(item => item.completedUserIds && item.completedUserIds.includes(userId));

    return completedItems.length / items.length * 100;
};

const concat = (x,y) =>
    x.concat(y)

const flatMap = (f,xs) =>
    xs.map(f).reduce(concat, [])

Array.prototype.flatMap = function(f) {
    return flatMap(f,this)
}

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
