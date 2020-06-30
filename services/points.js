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

module.exports = {findAll, insert};