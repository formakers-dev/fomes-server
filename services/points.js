const PointRecords = require('../models/point-records').Model;

const findAll = (userId) => {
  return PointRecords.find({userId : userId})
};

const insert = (userId, pointRecord, type, status) => {
  return PointRecords.create({
    userId : userId,
    date : new Date(),
    point : pointRecord.point,
    type : type,
    status : status,
    description : pointRecord.description,
    phoneNumber : pointRecord.phoneNumber,
    metaData : pointRecord.metaData
  });
};

const getAvailablePoint = (userId) => {
  return PointRecords.aggregate([
    { $match: {userId: userId } },
    {
      $group: {
        _id: "$userId",
        point: { $sum: "$point" }
      }
    }
  ]).then(result => Promise.resolve(result && result.length > 0 ? result[0].point : 0))
};

module.exports = {
  findAll,
  insert,
  getAvailablePoint,
};