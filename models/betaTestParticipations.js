const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    // _id : mongoose.Schema.Types.ObjectId,
    userId: String,
    betaTestId: mongoose.Schema.Types.ObjectId,
    date: Date,
    type: String,
    status: String,

    // optional
    missionId: mongoose.Schema.Types.ObjectId,
});

const constants = {
    TYPE_BETA_TEST: "beta-test",
    TYPE_MISSION: "mission",
    STATUS_ATTEND: "attend",
    STATUS_COMPLETE: "complete",
};

module.exports = {
    Model: mongoose.model('participations', schema),
    Constants : constants,
};