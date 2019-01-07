const RequestsService = require('../services/requests');

const getRequestList = (req, res, next) => {
    RequestsService.findValidRequests(req.userId)
        .then(requests => res.json(requests))
        .catch(err => next(err))
};

const postRegister = (req, res, next) => {
    RequestsService.updateRegistered(req.userId, req.params.id)
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
}

module.exports = {
    getRequestList,
    postRegister
};