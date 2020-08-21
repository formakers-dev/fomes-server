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
    nickName: String,
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
    metaData: {
        updateTime: Date,
        appVersion: String,
        fomesAppVersion: String,
    },
});

const AppUsages = mongoose.model('app-usages', appUsagesSchema);
const Apps = mongoose.model('apps', appSchema);

module.exports = { AppUsages, Apps };
