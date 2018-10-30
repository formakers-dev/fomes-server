const {Apps} = require('../models/appUsages');

const combineAppInfos = (appUsages) => {
    return Apps.find({packageName: {$in: appUsages.map(i => i.packageName)}})
        .lean()
        .then(appInfos => Promise.resolve(
            appInfos.map(appInfo => {
                appInfo.categoryId = appInfo.categoryId1;
                appInfo.categoryName = appInfo.categoryName1;

                // TODO : List 형태로 구조 변경되면 아래 코드도 변경해야 한다
                delete appInfo.categoryId1;
                delete appInfo.categoryId2;
                delete appInfo.categoryName1;
                delete appInfo.categoryName2;

                return appInfo;
            })
        ))
        .then(appInfos => Promise.resolve(
            Object.values(appUsages.concat(appInfos)
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

module.exports = {combineAppInfos, getGameAppInfoForAnalysis, upsertWishedBy, removeUserFromWishedBy};