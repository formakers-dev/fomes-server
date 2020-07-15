const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new Schema({
    userId: String,
    date: Date,
    point: Number,
    type: String,
    status: String,
    description: String,
    metaData: {
        refType: String,
        refId: ObjectId
    },

    // for withdraw type
    phoneNumber: String,
});

module.exports = mongoose.model('point-records', schema);
