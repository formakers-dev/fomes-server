const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    // _id : mongoose.Schema.Types.ObjectId,
    userId: String,
    betaTestId: mongoose.Schema.Types.ObjectId,
    date: Date,

    // optional
    missionId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('participations', schema);