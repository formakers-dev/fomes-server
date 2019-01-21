const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const betaTestSchema = new Schema({
    id: Number,
    overviewImageUrl: String,
    title: String,
    subTitle: String,
    type: String,
    typeTags: Array,
    openDate: Date,
    closeDate: Date,
    apps: Array,
    actionType: String,
    action: String,
    reward: String,
    targetUserIds: false,
    completedUserIds: Array,
    requiredTime: Number,
    amount: String,
});

module.exports = mongoose.model('beta-tests', betaTestSchema);