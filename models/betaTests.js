const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const afterServiceSchema = new Schema({
    epilogue: String,
    companySays: String,
});

const betaTestSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    groupId: mongoose.Schema.Types.ObjectId,
    id: Number,
    overviewImageUrl: String,
    title: String,
    subTitle: String,
    tags: Array,
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
    isGroup: false,
    afterService: afterServiceSchema,
});

module.exports = mongoose.model('beta-tests', betaTestSchema);
