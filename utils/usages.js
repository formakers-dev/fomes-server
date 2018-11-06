const { parentCategories } = require('../models/categories');

const convertToUsages = (appUsages, propertySet, options) => {
    console.log("convertToUsages", "propertySet=", propertySet, "options=", options);

    return appUsages.map(usage => {
        const result = {
            id: usage.appInfos[0][propertySet.id],
            name: usage.appInfos[0][propertySet.name],
            totalUsedTime: usage.totalUsedTime,
        };

        if (usage.userId) {
            result.userId = usage.userId;
        }

        if (options.isFold) {
            const matchedGroups = result.id.match(`([^_]+)_.*`);
            if (matchedGroups) {
                const parentCategoryId = matchedGroups[1];
                if (Object.keys(parentCategories).includes(parentCategoryId)) {
                    result.id = parentCategoryId;
                    result.name = parentCategories[parentCategoryId];
                }
            }
        }

        if (options.isVerbose) {
            const appInfos = [];
            appInfos.push.apply(appInfos, usage.appInfos.map(appInfo => {
                appInfo.totalUsedTime = usage.totalUsedTime;
                return appInfo;
            }));
            result.appInfos = appInfos;
        }

        console.log("convertToUsages", result);

        return result;
    })
};

const summary = (usages) => {
    return Object.values(usages.reduce((map, usage) => {
        const key = usage.id;

        if (!map[key]) {
            map[key] = usage
        } else {
            map[key].totalUsedTime += usage.totalUsedTime;

            const appInfos = map[key].appInfos;
            if (appInfos) {
                appInfos.push.apply(appInfos, usage.appInfos);
            }
        }

        return map;
    }, {}));
};

module.exports = { convertToUsages, summary };