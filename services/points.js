const PointRecords = require('../models/point-records');

const findAll = (userId) => {
  return PointRecords.find({userId : userId})
};

module.exports = {findAll};