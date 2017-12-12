const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    userId: String,
    projectId: Number,
    interviewSeq: Number,
    slotId: String,
    type: String
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});
module.exports = mongoose.model('participation-histories', schema);