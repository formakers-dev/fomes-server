const User = require('../models/user').User;
const UserConstants = require('../models/user').Constants;
const UserController = require('../controller/user');
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
                    "update": {
                        "totalUsedTime": appUsage.totalUsedTime,
                        "updateTime": new Date()
                    },
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

// '/usages/app/category/:categoryId'
const getAppUsageByCategory = (req, res) => {
    findAppUsageByCategory(req.userId, req.params.categoryId)
        .then(appUsage => res.json(appUsage))
        .catch(err => console.log(err));
};

// '/usages/category'
// '/usages/category/:categoryId'
const getCategoryUsage = (req, res) => {
    AppUsages.find({userId: req.userId})
        .populate('appInfo')
        .lean()
        .then(appUsages => Promise.resolve(appUsages.filter(appusage => appusage.appInfo)))
        .then(appUsages => {
            const options = {
                isVerbose: req.query.verbose,
                isFold: req.query.fold
            };
            const categoryId = req.params.categoryId;

            res.json(summaryCategoryUsage(appUsages, categoryId, options));
        }).catch(err => console.log(err));
};

const getReport = (req, res) => {
    const result = { totalUsedTimeRank: [], usages: [] };

    // 사용시간 순위
    getTotalUsedTimeRankList(req.userId, req.params.categoryId).then(ranks => {
        result.totalUsedTimeRank = ranks;

        // 요청한 유저의 앱 사용 데이터
        return aggregateAppUsageByCategory(req.userId, req.params.categoryId);
    }).then(userUsages => {
        userUsages.groupType = UserConstants.mine;
        result.usages.push(userUsages);

        // 성별+나이대 동일 유저의 앱 사용 데이터
        return UserController.getSimilarUsers(req.body, UserConstants.gender | UserConstants.age);
    }).then(users => {
        return aggregateAppUsageByCategory(users.map(user => user.userId), req.params.categoryId);
    }).then(genderAgeAppUsages => {
        genderAgeAppUsages.groupType = UserConstants.gender | UserConstants.age;
        result.usages.push(genderAgeAppUsages);

        // 직업군 동일 유저의 앱 사용 데이터
        return UserController.getSimilarUsers(req.body, UserConstants.job);
    }).then(users => {
        return aggregateAppUsageByCategory(users.map(user => user.userId), req.params.categoryId);
    }).then(jobAppUsages => {
        jobAppUsages.groupType = UserConstants.job;
        result.usages.push(jobAppUsages);

        res.json(result);
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    })
};

/********** start of privates **********/
const getTotalUsedTimeRankList = (userId, categoryId) => {
    return new Promise((resolve, reject) => {
        AppUsages.aggregate([{
            $lookup: {
                from: 'apps',
                let: {upper_packagName: '$packageName'},
                pipeline: [
                    {
                        $match: {
                            $expr: {$eq: ['$packageName', '$$upper_packagName']},
                            categoryId1: { $regex: new RegExp(categoryId) }
                        }
                    },
                    {
                        $project: {
                            categoryId: '$categoryId1',
                            categoryName: '$categoryName1',
                            appName: '$appName',
                            developer: '$developer',
                            iconUrl: '$iconUrl'
                        }
                    }
                ],
                as: 'appInfo'
            }
        },
            {$match: {appInfo: {$gt: {}}}},
            {$match: {appInfo: {$gt: {}}}},
            {$unwind: "$appInfo"},
            {
                $group: {
                    _id: '$userId', totalUsedTime: {$sum: '$totalUsedTime'},
                }
            }
        ])
            .then(ranks => {
                const sortedRanks = ranks.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                const mine = sortedRanks.filter(rank => rank._id === userId)[0];
                const best = sortedRanks[0];
                const worst = sortedRanks[sortedRanks.length - 1];

                const result = [];
                result.push(mine, best, worst);

                resolve(result.filter(rank => rank).map(rank => {
                    return {
                        userId: rank._id,
                        rank: sortedRanks.indexOf(rank) + 1,
                        content: rank.totalUsedTime
                    }
                }));
            }).catch(err => {
            console.error(err);
            reject(err);
        })
    });
};

const aggregateAppUsageByCategory = (userIds, categoryId) => {
    return new Promise((resolve, reject) => {
        const filterQuery = {};

        if (userIds instanceof Array) {
            filterQuery.userId = {
                "$in": userIds
            }
        } else {
            filterQuery.userId = userIds;
        }

        AppUsages.aggregate([ { $match: filterQuery },
            {
                $lookup: {
                    from: 'apps',
                    let: { upper_packagName: '$packageName' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$packageName', '$$upper_packagName'] },
                                categoryId1: new RegExp(categoryId)
                            }
                        },
                        {
                            $project: {
                                categoryId: '$categoryId1',
                                categoryName: '$categoryName1',
                                appName: '$appName',
                                developer: '$developer',
                                iconUrl: '$iconUrl'
                            }
                        }
                    ],
                    as: 'appInfo'
                }
            },
            { $match: {appInfo: {$gt: {}}} },
            { $unwind: "$appInfo" },
            {
                $group: {
                    _id: '$packageName',
                    totalUsedTime: { $sum: '$totalUsedTime' },
                    packageName : { $first: '$packageName' },
                    appName: { $first: '$appInfo.appName' },
                    categoryId : { $first: '$appInfo.categoryId' },
                    categoryName: { $first: '$appInfo.categoryName' },
                    developer: { $first: '$appInfo.developer' },
                    iconUrl: { $first: '$appInfo.iconUrl' }
                }
            }
        ]).then(appUsages => {
            const result = {};

            // appUsages
            appUsages = appUsages.map(appUsage => {
                return {
                    id: appUsage.packageName,
                    name: appUsage.appName,
                    totalUsedTime: appUsage.totalUsedTime,
                    appInfos: [{
                        packageName: appUsage.packageName,
                        totalUsedTime : appUsage.totalUsedTime,
                        appName: appUsage.appName,
                        categoryId: appUsage.categoryId,
                        categoryName: appUsage.categoryName,
                        developer: appUsage.developer,
                        iconUrl: appUsage.iconUrl,
                    }]
                }
            });

            result.appUsages = appUsages;

            // categoryUsages
            result.categoryUsages = summaryUsages(appUsages, {
                    id: "categoryId",
                    name: "categoryName",
                }, { isVerbose: false });

            // developerUsages
            result.developerUsages = summaryUsages(appUsages, {
                    id: "developer",
                    name: "developer",
                }, { isVerbose: true });

            resolve(result)
        }).catch(err => {
            console.error(err);
            reject(err);
        })
    });
};

const summaryUsages = (appUsages, propertyName, options) => {
    return Object.values(appUsages.map(usage => {
        const result = {
            id: usage.appInfos[0][propertyName.id],
            name: usage.appInfos[0][propertyName.name],
            totalUsedTime: usage.totalUsedTime,
        };

        if (options.isVerbose) {
            result.appInfos = [ usage.appInfos[0] ];
        }

        return result;
    }).reduce((map, usage) => {
        const key = usage.id;

        if (!map[key]) {
            map[key] = usage
        } else {
            map[key].totalUsedTime += usage.totalUsedTime;

            if (map[key].appInfos) {
                map[key].appInfos.push(usage.appInfos[0]);
            }
        }

        return map;
    }, {}));
};

// populate 이용
const findAppUsageByCategory = (userId, categoryId) => {
    return new Promise((resolve, reject) => {
        const filterQuery = {};

        if (userId) {
            filterQuery.userId = userId;
        }

        AppUsages.find(filterQuery)
            .populate('appInfo')
            .lean()
            .then(appUsages => {
                resolve(appUsages.filter(appusage => appusage.appInfo
                    && new RegExp(`${categoryId}.*`).test(appusage.appInfo.categoryId1))
                    .sort((a, b) =>  a.totalUsedTime > b.totalUsedTime ? -1 : 1));
            }).catch(err => {
                console.error(err);
                reject(err)
        });
    });
};

const summaryCategoryUsage = (appUsages, categoryId, options) => {
    if (categoryId) {
        appUsages = appUsages.filter(appUsage => appUsage.appInfo.categoryId1.match(categoryId));
    }

    appUsages = appUsages.map(appUsage => {
        const categoryUsage = {
            categoryId: appUsage.appInfo.categoryId1,
            categoryName: appUsage.appInfo.categoryName1,
            totalUsedTime: appUsage.totalUsedTime,
        };

        if (options.isVerbose) {
            appUsage.appInfo.totalUsedTime = appUsage.totalUsedTime;
            categoryUsage.appInfos = [appUsage.appInfo];
        }

        return categoryUsage;
    });

    if (options.isFold) {
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
            if (options.isVerbose) {
                map[appUsage.categoryId].appInfos.push(appUsage.appInfos[0]);
            }
        }
        return map;
    }, {});

    return Object.values(categoryUsageMap).sort((a, b) =>  a.totalUsedTime > b.totalUsedTime ? -1 : 1);
};

const summaryDeveloperUsage = (appUsages, options) => {
    const developerUsages = appUsages.map(appUsage => {
        const developerUsage = {
            developer: appUsage.appInfo.developer,
            totalUsedTime: appUsage.totalUsedTime,
        };

        if (options.isVerbose) {
            appUsage.appInfo.totalUsedTime = appUsage.totalUsedTime;
            developerUsage.appInfos = [appUsage.appInfo];
        }
        return developerUsage;
    }).reduce((map, appUsage) => {
        if (!map[appUsage.developer]) {
            map[appUsage.developer] = appUsage;
        } else {
            map[appUsage.developer].totalUsedTime += appUsage.totalUsedTime;
            map[appUsage.developer].appInfos.push(appUsage.appInfos[0]);
        }
        return map;
    }, {});

    return Object.values(developerUsages).sort((a, b) =>  a.totalUsedTime > b.totalUsedTime ? -1 : 1);

};
/********** end of privates **********/

module.exports = {postShortTermStats, postAppUsages, getAppUsageByCategory, getCategoryUsage, getReport};