const mongoose = require('mongoose');
const downloadHistoriesSchema = new mongoose.Schema({
    userId : String
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
const downloadHistories = mongoose.model('download-histories', downloadHistoriesSchema);
module.exports = downloadHistories;