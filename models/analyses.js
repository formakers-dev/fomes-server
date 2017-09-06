const mongoose = require('mongoose');
const analysesSchema = new mongoose.Schema({
    userId : String,
    characterType : String,
    totalInstalledAppCount: Number,
    averageUsedMinutesPerDay: Number,
    mostUsedApp: String,
    mostDownloadCategories: [String],
    leastDownloadCategory: String,
    mostUsedCategories: [String],
    leastUsedCategory: String,
    lastUpdateTime: Date
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
const analyses = mongoose.model('analyses', analysesSchema);
module.exports = analyses;