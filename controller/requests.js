const RequestsService = require('../services/requests');

const getRequestList = (req, res, next) => {
    RequestsService.getValidRequests(req.userId)
        .then(requests => res.json(requests))
        .catch(err => next(err))
};

module.exports = {
    getRequestList
};