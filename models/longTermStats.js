const mongoose = require('mongoose');
const longTermStatsSchema = new mongoose.Schema({
    email: String,
    stats : Array
});
const longTermStatsList = mongoose.model('long-term-stats', longTermStatsSchema);
module.exports = longTermStatsList;