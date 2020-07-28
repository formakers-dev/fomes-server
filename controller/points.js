const PointsService = require('../services/points');
const PointConstants = require('../models/point-records').Constants;
const Boom = require('boom');

const getPointRecords = (req, res, next) => {
  PointsService.findAll(req.userId)
    .then(points => res.json(points))
    .catch(err => next(err))
};

const putSavePointRecord = (req, res, next) => {
  const status = PointConstants.STATUS.COMPLETED;

  PointsService.insertDocForSaveType(req.userId, req.body, status)
    .then(() => res.sendStatus(200))
    .catch(err => next(err));
};

const putExchangePointRecord = async (req, res, next) => {
  const status = PointConstants.STATUS.REQUESTED;
  const operationStatus = PointConstants.OPERATION_STATUS.OPENED;

  if (Math.abs(req.body.point) < 5000) {
    next(Boom.preconditionFailed('Invalid Exchange Point'));
    return;
  }

  const availablePoint = await PointsService.getAvailablePoint(req.userId);
  if (req.body.point > availablePoint) {
    next(Boom.preconditionFailed('Invalid Exchange Point'));
    return;
  }

  if (req.body.point > 0) {
    req.body.point *= -1;
  }

  PointsService.insertDocForExchangeType(req.userId, req.body, status, operationStatus)
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

const getRequestedExchangePoint = (req, res, next) => {
  PointsService.getRequestedExchangePoint(req.userId)
    .then(result => {
      res.json({
        point: result
      })
    })
    .catch(err => next(err))
};

module.exports = {
  getPointRecords,
  putSavePointRecord,
  putExchangePointRecord,
  getAvailablePoint,
  getRequestedExchangePoint
};