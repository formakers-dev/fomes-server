const EventLogs = require('../models/eventLogs');

const insert = (userId, eventLog) => {
    eventLog.userId = userId;
    eventLog.when = new Date();

    return EventLogs.create(eventLog);
};

module.exports = {
    insert
};