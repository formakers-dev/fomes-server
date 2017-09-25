const mongoose = require('mongoose');
const shortTermStatsSchema = new mongoose.Schema({
    userId: String,
    lastUpdateStatTimestamp: Number,
    stats : Array
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
const shortTermStatsList = mongoose.model('short-term-stats', shortTermStatsSchema);
module.exports = shortTermStatsList;