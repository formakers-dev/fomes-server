const RequestsService = require('../services/requests');

const getRequestList = (req, res, next) => {
    RequestsService.findValidRequests(req.userId)
        .then(requests => res.json(requests))
        .catch(err => next(err))
};

const postComplete = (req, res, next) => {
    RequestsService.updateCompleted(req.params.id, req.userId)
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

module.exports = {
    getRequestList,
    postComplete
};