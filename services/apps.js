const {Apps} = require('../models/appUsages');

class NotFoundAppError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

const getAppForPublic = (packageName, userId) => {
    return Apps.findOne({packageName : packageName})
        .then(app => {
            if (app)
                return convertToPublicAppInfo(app, userId);
            else
                throw new NotFoundAppError();
        })
        .catch(err => Promise.reject(err));
};

const getAppsForPublic = (packageNames, userId) => {
    return Apps.find({packageName : {$in: packageNames}})
        .then(apps => apps.map(app => convertToPublicAppInfo(app, userId)))
        .catch(err => Promise.reject(err));
};

const convertToPublicAppInfo = (app, userId) => {
    return {
        packageName : app.packageName,
        appName : app.appName,
        categoryId : app.categoryId1,
        categoryName : app.categoryName1,
        developer : app.developer,
        iconUrl : app.iconUrl,
        star : app.star,
        installsMin : app.installsMin,
        installsMax : app.installsMax,
        contentsRating : app.contentsRating,
        imageUrls : app.imageUrls,
        isWished : !!(app.wishedBy && app.wishedBy.includes(userId))
    };
};

const getGameAppInfoForAnalysis = (packageNames) => {
    return Apps.find({packageName: {$in: packageNames}, categoryId1: new RegExp(`GAME.*`)},
        {_id: false, packageName: true, appName: true, categoryId1: true, categoryName1: true, developer: true, iconUrl: true});
};

const upsertWishedBy = (packageName, userId) => {
    return Apps.findOneAndUpdate({packageName: packageName},
        {$addToSet: {wishedBy: userId}}, {upsert: true});
};

const removeUserFromWishedBy = (packageName, userId) => {
    return Apps.findOneAndUpdate({packageName: packageName},
        {$pull: {wishedBy: userId}});
};

module.exports = {
    getGameAppInfoForAnalysis,
    upsertWishedBy,
    removeUserFromWishedBy,
    getAppForPublic,
    getAppsForPublic,
    NotFoundAppError,
};