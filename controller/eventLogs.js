const EventLogsService = require('../services/eventLogs');

const postEventLog = (req, res, next) => {
    EventLogsService.insert(req.userId, req.body)
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

module.exports = {
    postEventLog
};