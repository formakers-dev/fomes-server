const {Apps} = require('../models/appUsages');

const combineAppInfos = (appUsages) => {
    return getAppsWithRepresentativeCategory(appUsages.map(i => i.packageName))
        .then(convertedApps => Promise.resolve(
            Object.values(appUsages.concat(convertedApps)
                .reduce((map, appUsage) => {
                    const key = appUsage.packageName;
                    if (!map[key]) {
                        map[key] = appUsage;
                    } else {
                        map[key] = Object.assign(map[key], appUsage);
                    }

                    return map;
                }, {})))
        ).catch(err => Promise.reject(err));
};

const getAppsWithRepresentativeCategory = (packageNames) => {
    return Apps.find({packageName: {$in: packageNames}})
        .lean()
        .then(apps => convertCategoryInfoToRepresentativeCategory(apps))
        .catch(err => Promise.reject(err));
};

const convertCategoryInfoToRepresentativeCategory = (apps) => {
    return Promise.resolve(
        apps.map(app => {
            app.categoryId = app.categoryId1;
            app.categoryName = app.categoryName1;

            // TODO : List 형태로 구조 변경되면 아래 코드도 변경해야 한다
            delete app.categoryId1;
            delete app.categoryId2;
            delete app.categoryName1;
            delete app.categoryName2;

            return app;
        })
    );
};

const getGameAppInfoForAnalysis = (packageNames) => {
    return Apps.find({packageName: {$in: packageNames}, categoryId1: new RegExp(`GAME.*`)},
        {_id: false, packageName: true, categoryId1: true, developer: true});
};

const upsertWishedBy = (packageName, userId) => {
    return Apps.findOneAndUpdate({packageName: packageName},
        {$addToSet: {wishedBy: userId}}, {upsert: true});
};

const removeUserFromWishedBy = (packageName, userId) => {
    return Apps.findOneAndUpdate({packageName: packageName},
        {$pull: {wishedBy: userId}});
};

const replaceWishedByToWishedByMe = (app, userId) => {
    app.wishedByMe = !!(app.wishedBy && app.wishedBy.includes(userId));
    delete app.wishedBy;
    return app;
};

module.exports = {
    combineAppInfos,
    getGameAppInfoForAnalysis,
    upsertWishedBy,
    removeUserFromWishedBy,
    replaceWishedByToWishedByMe,
    getAppsWithRepresentativeCategory
};