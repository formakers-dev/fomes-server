const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const awardRecordSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    betaTestId: mongoose.Schema.Types.ObjectId,
    type: String,
    reward: {
        description: String,
        price: Number,
    }
});

module.exports = mongoose.model('award-records', awardRecordSchema);
