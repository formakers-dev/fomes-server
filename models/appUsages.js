const mongoose = require('mongoose');
const appUsagesSchema = new mongoose.Schema({
    packageName: String,
    userId: String,
    totalUsedTime: Number
});
const appUsages = mongoose.model('app-usages', appUsagesSchema);
module.exports = appUsages;