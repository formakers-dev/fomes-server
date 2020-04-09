const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    betaTestId: mongoose.Schema.Types.ObjectId,
    order: Number,
    title: String,
    description: String,
    descriptionImageUrl: String,
    guide: String,
    deeplink: String,
    options: Array,
    type: String,

    // play type - optional
    packageName: String,

    // 임시
    actionType: String,
    action: String,
});

module.exports = mongoose.model('missions', schema);