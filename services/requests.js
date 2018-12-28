const Requests = require('../models/requests');

const findValidRequests = (userId) => {
    const currentTime = new Date();

    return Requests.find({
            openDate: { $lte: currentTime } ,
            closeDate: { $gte: currentTime },
            registeredUserIds: { $nin: [userId] },
            $or: [
                { targetUserIds: { $exists: false }},
                { targetUserIds: { $in: [ userId ] } },
            ],
        }, {targetUserIds: 0, registeredUserIds: 0 });
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