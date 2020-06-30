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
});

module.exports = mongoose.model('point-records', schema);
