const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventLogsSchema = new Schema({
    userId: String,
    when: Date,
    where: String,
    action: String,
    ref: String
});

module.exports = mongoose.model('event-logs', eventLogsSchema);