const PointsService = require('../services/points');
const Boom = require('boom');

const getPointRecords = (req, res, next) => {
  PointsService.findAll(req.userId)
    .then(points => res.json(points))
    .catch(err => next(err))
};

const putPointRecord = (req, res, next) => {
  let type;

  if (req.path === '/') {
    type = "save";
  } else if (req.path === '/withdraw') {
    type = "withdraw";

    if (Math.abs(req.body.point) < 5000) {
      next(Boom.preconditionFailed('Invalid Withdraw point'));
      return;
    }

    if (req.body.point > 0) {
      req.body.point *= -1;
    }
  }

  PointsService.insert(req.userId, req.body, type)
    .then(() => res.sendStatus(200))
    .catch(err => next(err));
};

const getAvailablePoint = (req, res, next) => {
  PointsService.getAvailablePoint(req.userId)
    .then(result => {
      res.json({
        point: result
      })
    })
    .catch(err => next(err))
};

module.exports = {
  getPointRecords,
  putPointRecord,
  getAvailablePoint
};