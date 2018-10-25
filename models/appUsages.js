const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    packageName: String,
    appName: String,
    categoryId1: String,
    categoryId2: String,
    categoryName1: String,
    categoryName2: String,
    categoryIds: Array,
    developer: String,
    iconUrl: String,
    wishedBy: Array,
});

const appUsagesSchema = new mongoose.Schema({
    userId: String,
    birthday: Number,
    job: Number,
    gender: String,
    packageName: String,
    developer: String,
    categoryId: String,
    totalUsedTime: Number,
    updateTime: Date
});

appUsagesSchema.virtual('appInfo', {
    ref: 'apps',
    localField: 'packageName',
    foreignField: 'packageName',
    justOne: true,
});

const AppUsages = mongoose.model('app-usages', appUsagesSchema);
const Apps = mongoose.model('apps', appSchema);

module.exports = { AppUsages, Apps };