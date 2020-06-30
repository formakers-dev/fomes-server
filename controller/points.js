const PointsService = require('../services/points');

const getPointRecords = (req, res, next) => {
  PointsService.findAll(req.userId)
    .then(points => res.json(points))
    .catch(err => next(err))
};

module.exports = {getPointRecords};