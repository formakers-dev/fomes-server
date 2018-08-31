const qs = require('querystring');
const User = require('../models/user');
const { AppUsages } = require('../models/appUsages');
const Stats = require('./../models/shortTermStats');
const { parentCategories } = require('../models/categories');

const postShortTermStats = (req, res) => {
    if (!Array.isArray(req.body)) {
        res.sendStatus(400);
    } else if (req.body.length < 1) {
        res.sendStatus(200);
    } else {
        const userId = req.userId;
        const bulkOps = [];

        req.body.forEach(shortTermStat => {
            shortTermStat.userId = userId;
            bulkOps.push({
                'insertOne': {
                    'document': shortTermStat,
                }
            });
        });

        Stats.bulkWrite(bulkOps).then(() =>
            User.findOneAndUpdate({userId: req.userId},
                {$set: {"lastStatsUpdateTime" : new Date()}},
                {upsert: true})
        ).then(() => res.sendStatus(200))
        .catch(err => {
                console.log(JSON.stringify(err, null, 2));
                res.sendStatus(500);
            });
    }
};

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
            res.json(appusages.filter(appusage => appusage.appInfo
                    && new RegExp(regex).test(appusage.appInfo.categoryId1))
                .sort((a, b) =>  a.totalUsedTime > b.totalUsedTime ? -1 : 1));
        }).catch(err => console.log(err));
};

const getCategoryUsage = (req, res) => {
    AppUsages.find({userId: req.userId})
        .populate('appInfo')
        .lean()
        .then(appUsages => Promise.resolve(appUsages.filter(appusage => appusage.appInfo)))
        .then(appUsages => {
            const options = req.query.options ? JSON.parse(qs.unescape(req.query.options)) : undefined;
            const categoryId = req.params.categoryId;

            appUsages = appUsages.map(appUsage => {
                appUsage.appInfo.totalUsedTime = appUsage.totalUsedTime;
                return {
                    categoryId: appUsage.appInfo.categoryId1,
                    categoryName: appUsage.appInfo.categoryName1,
                    totalUsedTime: appUsage.totalUsedTime,
                    appInfos: [ appUsage.appInfo ],
                };
            });

            if (categoryId) {
                appUsages = appUsages.filter(appusage => appusage.categoryId.match(categoryId));
            }

            if (options && options.fold === true) {
                appUsages = appUsages.map(appUsage => {
                    const matchedGroups = appUsage.categoryId.match(`([^_]+)_.*`);
                    if (matchedGroups) {
                        const parentCategoryId = matchedGroups[1];
                        if (Object.keys(parentCategories).includes(parentCategoryId)) {
                            appUsage.categoryId = parentCategoryId;
                            appUsage.categoryName = parentCategories[parentCategoryId];
                        }
                    }
                    return appUsage;
                });
            }

            const categoryUsageMap = appUsages.reduce((map, appUsage) => {
                if (!map[appUsage.categoryId]) {
                    map[appUsage.categoryId] = appUsage;
                } else {
                    map[appUsage.categoryId].totalUsedTime += appUsage.totalUsedTime;
                    map[appUsage.categoryId].appInfos.push(appUsage.appInfos[0]);
                }
                return map;
            }, {});

            res.json(Object.values(categoryUsageMap).sort((a, b) =>  a.totalUsedTime > b.totalUsedTime ? -1 : 1));
        }).catch(err => console.log(err));
};

module.exports = {postShortTermStats, postAppUsages, getAppUsageByCategory, getCategoryUsage};