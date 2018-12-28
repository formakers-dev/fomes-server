const Requests = require('../models/requests');

const getValidRequests = (userId) => {
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

module.exports = {
    getValidRequests
};