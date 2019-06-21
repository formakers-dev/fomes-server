const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const afterServiceSchema = new Schema({
    awards: String,
    epilogue: String,
    companySays: String,
});

const Rewards = {
    minimumDelay: Number,
    list: Array,
};

const betaTestSchema = new Schema({
    groupId: mongoose.Schema.Types.ObjectId,
    id: Number,
    subTitle: String,
    apps: Array,
    actionType: String,
    action: String,
    reward: String,
    requiredTime: Number,
    completedUserIds: Array,
    amount: String,
    isGroup: false,

    // for group
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    tags: Array,
    overviewImageUrl: String,
    iconImageUrl: String,
    openDate: Date,
    closeDate: Date,
    rewards: Rewards,
    missions: Array,
    afterService: afterServiceSchema,
    targetUserIds: false,
});

module.exports = mongoose.model('beta-tests', betaTestSchema);
