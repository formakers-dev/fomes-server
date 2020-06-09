const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const awardRecordSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    nickName: String,
    betaTestId: mongoose.Schema.Types.ObjectId,
    type: String,
    typeCode : Number,
    reward: {
        description: String,
        price: Number,
    }
});

const AwardRecords = mongoose.model('award-records', awardRecordSchema);

module.exports = { AwardRecords };
