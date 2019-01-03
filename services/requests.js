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
                isRegistered: {
                    $in : [userId, "$registeredUserIds"]
                },
            }
        }
    ]);
};

const updateRegistered = (userId, requestId) => {
    return Requests.findOneAndUpdate({ $and: [
                { id: requestId },
                { registeredUserIds: { $nin: [ userId ] } }
           ]}, { $push: { registeredUserIds: userId } }, { upsert: true });
};

module.exports = {
    findValidRequests,
    updateRegistered
};