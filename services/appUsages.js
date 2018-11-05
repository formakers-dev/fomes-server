const moment = require('moment');
const UsagesUtil = require('../utils/usages');
const { AppUsages } = require('../models/appUsages');

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
            console.error("getTotalUsedTimeRankList", "userId=", userId, "err=", err);
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
                    let: { upper_packageName: '$packageName' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$packageName', '$$upper_packageName'] },
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
            result.categoryUsages = UsagesUtil.summary(UsagesUtil.convertToUsages(appUsages, {
                id: "categoryId",
                name: "categoryName",
            }, { isVerbose: false }));

            // developerUsages
            result.developerUsages = UsagesUtil.summary(UsagesUtil.convertToUsages(appUsages, {
                id: "developer",
                name: "developer",
            }, { isVerbose: true }));

            resolve(result)
        }).catch(err => {
            console.error("aggregateAppUsageByCategory", "userIds.length=", userIds.length, "cetegoryId=", categoryId, "err=", err);
            reject(err);
        })
    });
};

/** Start for Recommend Features **/
const getSimilarUsers = (user, page, limit, excludeUserId) => {
    const currentYear = moment().format('YYYY');
    const beforeDiff = (currentYear - user.birthday) % 10;
    const afterDiff = 10 - beforeDiff;

    let query = [
        {
            $match: {
                $and : [
                    { userId: {$ne : excludeUserId}},
                    { gender: user.gender},
                    { birthday: { $gte: user.birthday - afterDiff + 1 } },
                    { birthday: { $lte: user.birthday + beforeDiff + 1 } },
                ]
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    if (page && limit) {
        query = query.concat([{
            $skip: (page - 1) * limit
        }, {
            $limit: limit
        }]);
    }

    return AppUsages.aggregate(query);
};

const getCategoryAppUsages = (categoryId, excludeUserId) => {
    let query = [
        {
            $match: {
                $and: [
                    { userId: { $ne : excludeUserId }},
                    { categoryId: categoryId }
                ]
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    return AppUsages.aggregate(query);
};

const getDeveloperAppUsages = (developer, excludeUserId) => {
    let query = [
        {
            $match: {
                $and: [
                    { userId: {$ne : excludeUserId}},
                    { developer: developer }
                ]
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    return AppUsages.aggregate(query);
};

const getUsersAppUsages = (userIds, excludePackageName, excludeUserId) => {
    const excludeUserIdIndex = userIds.indexOf(excludeUserId);

    if (excludeUserIdIndex > -1) {
        userIds.splice( userIds.indexOf(excludeUserId), 1 );
    }

    const query = [
        {
            $match: {
                $and : [
                    { packageName: {$ne : excludePackageName}},
                    { userId: {$in : userIds}},
                ]
            }
        }, {
            $group: {
                _id: '$packageName',
                totalUsedTime: { $sum: '$totalUsedTime' },
                developer: { $first: '$developer' },
                categoryId: { $first: '$categoryId' },
            }
        }, {
            $project: {
                packageName: '$_id',
                totalUsedTime: true,
                developer: true,
                categoryId: true,
            }
        }, {
            $sort: { totalUsedTime: -1 }
        }
    ];

    return AppUsages.aggregate(query);
};

/** start of using by populate **/
const findAppUsages = (userId) => {
    const filterQuery = {};

    if (userId) {
        filterQuery.userId = userId;
    }

    return AppUsages.find(filterQuery)
        .populate('appInfo')
        .lean()
        .then(appUsages => {
            const result = appUsages.filter(appUsage => appUsage.appInfo)
                .map(appUsage => {
                    appUsage.appInfos = [ appUsage.appInfo ];
                    delete appUsage.appInfo;

                    return appUsage;
                });
            return Promise.resolve(result);
        })
        .catch(err => Promise.reject(err));
};

const findAppUsageByCategory = (userId, categoryId, options) => {
    return findAppUsages(userId).then(appUsages => {
        appUsages = UsagesUtil.convertToUsages(
            appUsages,
            { id: "packageName", name: "appName" },
            { isVerbose: true, isFold: options.isFold }
         );

        if (categoryId) {
            appUsages = appUsages.filter(appusage => appusage.appInfos.length > 0
                && new RegExp(`${categoryId}.*`).test(appusage.appInfos[0].categoryId1));
        }

        return Promise.resolve(appUsages);
    }).catch(err => {
        console.error("findAppUsageByCategory", "userId=", userId, "err=", err);
        return Promise.reject(err);
    });
};

const findCategoryUsages = (userId, categoryId, options) => {
    return findAppUsageByCategory(userId, categoryId, options)
        .then(appUsages => Promise.resolve(UsagesUtil.summary(
                UsagesUtil.convertToUsages(appUsages, { id: "categoryId1", name: "categoryName1"}, options)
            )
        ))
        .catch(err => Promise.reject(err));
};
/** end of using by populate **/

const refreshAppUsages = (user, appInfos, appUsages) => {
    const bulkOps = [];

    bulkOps.push({
        'deleteMany': {
            'filter': { 'userId': user.userId }
        }
    });

    const appUsagesWithAppInfo = Object.values(appUsages.concat(appInfos)
        .reduce((map, appUsage) => {
            const key = appUsage.packageName;
            if (!map[key]) {
                map[key] = appUsage;
            } else {
                map[key] = Object.assign(map[key], appUsage);
            }

            return map;
        }, {}));

    appUsagesWithAppInfo.forEach(appUsage => {
        bulkOps.push({
            'insertOne': {
                'document': {
                    'userId': user.userId,
                    'birthday': user.birthday,
                    'job': user.job,
                    'gender': user.gender,
                    'packageName': appUsage.packageName,
                    'developer': appUsage.developer,
                    'categoryId': appUsage.categoryId1,
                    "totalUsedTime": appUsage.totalUsedTime,
                    "updateTime": new Date()
                }
            }
        });
    });

    return AppUsages.bulkWrite(bulkOps);
};

const getUserIdsUsingApp = (packageName) => {
  return AppUsages.aggregate([
      {$match: {packageName : packageName}},
      {$group: {_id: '$userId'}}
  ]).then(userIds => Promise.resolve(userIds.map(userId => userId._id)));
};


module.exports = {
    getTotalUsedTimeRankList,
    aggregateAppUsageByCategory,
    findAppUsageByCategory,
    findCategoryUsages,
    refreshAppUsages,
    getSimilarUsers,
    getCategoryAppUsages,
    getDeveloperAppUsages,
    getUsersAppUsages,
    getUserIdsUsingApp,
};