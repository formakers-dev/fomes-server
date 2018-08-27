const { AppUsages } = require('../models/appUsages');
const { parentCategories } = require('../models/categories');

const postAppUsages = (req, res) => {
    if (!Array.isArray(req.body)) {
        res.sendStatus(400);
    } else if (req.body.length < 1) {
        res.sendStatus(200);
    } else {
        const bulkOps = [];
        const userId = req.userId;

        req.body.forEach(appUsage => {
            bulkOps.push({
                'updateOne': {
                    "filter": {"userId": userId, "packageName": appUsage.packageName},
                    "update": {"totalUsedTime": appUsage.totalUsedTime},
                    "upsert": true
                }
            });
        });

        AppUsages.bulkWrite(bulkOps, err => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.sendStatus(200);
            }
        });
    }
};

const getAppUsageByCategory = (req, res) => {
    const regex = `${req.params.categoryId}.*`;

    AppUsages.find({userId: req.userId})
        .populate('appInfo')
        .lean()
        .then(appusages => {
            res.json(appusages.filter(appusage => appusage.appInfo !== null && appusage.appInfo !== undefined
                    && new RegExp(regex).test(appusage.appInfo.categoryId1))
                .sort((a, b) => b.totalUsedTime > a.totalUsedTime));
        }).catch(err => console.log(err));
};

const getCategoryUsage = (req, res) => {
    AppUsages.find({userId: req.userId})
        .populate('appInfo')
        .lean()
        .then(appusages => {

            appusages = appusages.filter(appusage => appusage.appInfo !== null && appusage.appInfo !== undefined);

            const categorySumMap = {};

            appusages.map(appusage => {
                const regex = `([^_]+)_.*`;
                const matchedGroups = appusage.appInfo.categoryId1.match(regex);
                if (matchedGroups !== null && matchedGroups !== undefined) {
                    const parentCategoryId = matchedGroups[1];
                    if (Object.keys(parentCategories).includes(parentCategoryId)) {
                        appusage.appInfo.categoryId1 = parentCategoryId;
                        appusage.appInfo.categoryName1 = parentCategories[parentCategoryId];
                    }
                }
                return appusage;
            }).forEach(appusage => {
                const categoryId = appusage.appInfo.categoryId1;

                if (categorySumMap[categoryId] === null
                    || categorySumMap[categoryId] === undefined) {
                    categorySumMap[categoryId] = {
                        totalUsedTime: appusage.totalUsedTime,
                        name: appusage.appInfo.categoryName1
                    };
                } else {
                    categorySumMap[categoryId].totalUsedTime += appusage.totalUsedTime;
                }
            });

            res.json(Object.keys(categorySumMap).map(key => {
                return {
                    categoryId: key,
                    categoryName: categorySumMap[key].name,
                    totalUsedTime: categorySumMap[key].totalUsedTime
                };
            }).sort((a, b) => b.totalUsedTime > a.totalUsedTime));
        }).catch(err => console.log(err));
};

module.exports = {postAppUsages, getAppUsageByCategory, getCategoryUsage};