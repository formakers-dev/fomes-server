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
    star : Number,
    installsMin : Number,
    installsMax : Number,
    contentsRating : String,
    imageUrls : Array,
    wishedBy: Array,
});

const appUsagesSchema = new mongoose.Schema({
    date: Date,
    userId: String,
    birthday: Number,
    job: Number,
    gender: String,
    packageName: String,
    appName: String,
    developer: String,
    categoryId: String,
    categoryName: String,
    iconUrl: String,
    totalUsedTime: Number,
    updateTime: Date
});

// TODO: 버추얼 스키마 제거
appUsagesSchema.virtual('appInfo', {
    ref: 'apps',
    localField: 'packageName',
    foreignField: 'packageName',
    justOne: true,
});

const AppUsages = mongoose.model('app-usages', appUsagesSchema);
const Apps = mongoose.model('apps', appSchema);

module.exports = { AppUsages, Apps };
