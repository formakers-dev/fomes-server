const mongoose = require('mongoose');
const longTermStatsSchema = new mongoose.Schema({
    userId: String,
    duration: String,
    stats : Array
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
const longTermStatsList = mongoose.model('long-term-stats', longTermStatsSchema);
module.exports = longTermStatsList;