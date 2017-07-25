const mongoose = require('mongoose');
const shortTermStatsSchema = new mongoose.Schema({
    email: String,
    stats : Array
});
const shortTermStatsList = mongoose.model('short-term-stats', shortTermStatsSchema);
module.exports = shortTermStatsList;