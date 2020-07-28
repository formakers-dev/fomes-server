const PointRecords = require('../models/point-records').Model;
const PointConstants = require('../models/point-records').Constants;

const findAll = (userId) => {
  return PointRecords.find({userId : userId})
};

const insertDocForSaveType = (userId, pointRecord, status) => {
  const pointRecordDoc = {
    userId : userId,
    date : new Date(),
    point : pointRecord.point,
    type : PointConstants.TYPE.SAVE,
    status : status,
    description : pointRecord.description,
    metaData : pointRecord.metaData,
  };

  return PointRecords.create(pointRecordDoc);
};

const insertDocForExchangeType = (userId, pointRecord, status, operationStatus) => {
  const pointRecordDoc = {
    userId : userId,
    date : new Date(),
    point : pointRecord.point,
    type : PointConstants.TYPE.EXCHANGE,
    status : status,
    description : pointRecord.description,
    phoneNumber : pointRecord.phoneNumber,
  };

  if (operationStatus) {
    pointRecordDoc.operationData = {
      status: operationStatus
    };
  }

  return PointRecords.create(pointRecordDoc);
};

const getAvailablePoint = (userId) => {
  return PointRecords.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$userId",
        point: { $sum: "$point" }
      }
    }
  ]).then(result => {
    const point = convertToValidPointResult(result);
    return Promise.resolve(point);
  })
};

const getAccumulatedPoint = (userId) => {
  return PointRecords.aggregate([
    {
      $match: {
        userId: userId,
        type: PointConstants.TYPE.SAVE,
        status: PointConstants.STATUS.COMPLETED,
      }
    },
    {
      $group: {
        _id: "$userId",
        point: { $sum: "$point" }
      }
    }
  ]).then(result => {
    const point = convertToValidPointResult(result);
    return Promise.resolve(point);
  })
};

const convertToValidPointResult = (pointResult) => pointResult && pointResult.length > 0 ? pointResult[0].point : 0;

module.exports = {
  findAll,
  insertDocForSaveType,
  insertDocForExchangeType,
  getAvailablePoint,
  getAccumulatedPoint,
};