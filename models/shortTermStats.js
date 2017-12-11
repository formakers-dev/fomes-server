const mongoose = require('mongoose');
const shortTermStatsSchema = new mongoose.Schema({
    userId: String,
    packageName: String,
    startTimeStamp: Number,
    endTimeStamp: Number,
    totalUsedTime: Number
});
const shortTermStatsList = mongoose.model('short-term-stats', shortTermStatsSchema);
module.exports = shortTermStatsList;