const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    id: Number,
    title: String,
    subTitle: String,
    type: String,
    typeTags: Array,
    openDate: Date,
    closeDate: Date,
    apps: Array,
    actionType: String,
    action: String,
    targetUserIds: false,
    registeredUserIds: Array,
});

module.exports = mongoose.model('requests', requestSchema);