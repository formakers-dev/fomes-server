const mongoose = require('mongoose');
const longTermStatsSchema = new mongoose.Schema({
    userId: String,
    duration: String,
    stats : Array
});
const longTermStatsList = mongoose.model('long-term-stats', longTermStatsSchema);
module.exports = longTermStatsList;