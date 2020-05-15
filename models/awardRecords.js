const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const awardRecordSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    nickName: String,
    betaTestId: mongoose.Schema.Types.ObjectId,
    type: String,
    reward: {
        description: String,
        price: Number,
    }
});

const AwardRecords = mongoose.model('award-records', awardRecordSchema);

const AwardType = {
    best: "best",
    good: "good",
    normal: "normal",
    participated: "participated",
    etc: "etc",

    // for query params
    mine: "mine"
};

module.exports = { AwardRecords, AwardType };
