const mongoose = require('mongoose');
const DeviceInfo = require('./users').Device;

const shortTermStatsSchema = new mongoose.Schema({
    userId: String,
    packageName: String,
    startTimeStamp: Number,
    endTimeStamp: Number,
    totalUsedTime: Number,
    versionName: String,
    device: DeviceInfo,
});

const shortTermStatsList = mongoose.model('short-term-stats', shortTermStatsSchema);
module.exports = shortTermStatsList;