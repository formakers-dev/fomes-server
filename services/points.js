const PointRecords = require('../models/point-records');

const findAll = (userId) => {
  return PointRecords.find({userId : userId})
};

const insert = (userId, pointRecord) => {
  return PointRecords.create({

    userId : userId,
    date : new Date(),
    point : pointRecord.point,
    type : 'save',
    status : 'completed',
    description : pointRecord.description,
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