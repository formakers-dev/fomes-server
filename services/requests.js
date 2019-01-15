const Requests = require('../models/requests');

const findValidRequests = (userId) => {
    const currentTime = new Date();

    return Requests.aggregate([
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
                title: true,
                subTitle: true,
                type: true,
                typeTags: true,
                openDate: true,
                closeDate: true,
                actionType: true,
                action: true,
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

const updateCompleted = (requestId, userId) => {
    return Requests.findOneAndUpdate({
        $and: [
            {id: requestId},
            {completedUserIds: {$nin: [userId]}}
        ]
    }, {$push: {completedUserIds: userId}}, {upsert: true});
};

module.exports = {
    findValidRequests,
    updateCompleted
};