const mongoose = require('mongoose');
const eventStatsSchema = new mongoose.Schema({
    userId: String,
    stats : Array
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
const eventStatsList = mongoose.model('event-stats', eventStatsSchema);
module.exports = eventStatsList;