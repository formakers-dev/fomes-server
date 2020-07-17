const PointsService = require('../services/points');
const PointConstants = require('../models/point-records').Constants;
const Boom = require('boom');

const getPointRecords = (req, res, next) => {
  PointsService.findAll(req.userId)
    .then(points => res.json(points))
    .catch(err => next(err))
};

const putPointRecord = async (req, res, next) => {
  let type, status;

  if (req.path === '/') {
    type = PointConstants.TYPE.SAVE;
    status = PointConstants.STATUS.COMPLETED;
  } else if (req.path === '/withdraw') {
    type = PointConstants.TYPE.WITHDRAW;
    status = PointConstants.STATUS.REQUEST;

    if (Math.abs(req.body.point) < 5000) {
      next(Boom.preconditionFailed('Invalid Withdraw point'));
      return;
    }

    const availablePoint = await PointsService.getAvailablePoint(req.userId);
    if (req.body.point > availablePoint) {
      next(Boom.preconditionFailed('Invalid Withdraw point'));
      return;
    }

    if (req.body.point > 0) {
      req.body.point *= -1;
    }
  }

  PointsService.insert(req.userId, req.body, type, status)
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