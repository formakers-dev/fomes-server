const PointsService = require('../services/points');

const getPointRecords = (req, res, next) => {
  PointsService.findAll(req.userId)
    .then(points => res.json(points))
    .catch(err => next(err))
};

const putPointRecord = (req, res, next) => {
  PointsService.insert(req.userId, req.body)
    .then(() => res.sendStatus(200))
    .catch(err => next(err));
};

module.exports = {getPointRecords, putPointRecord};