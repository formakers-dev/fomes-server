const Users = require('../models/users').Users;
const UserConstants = require('../models/users').Constants;
const Stats = require('./../models/shortTermStats');
const AppUsagesService = require('../services/appUsages');
const AppService = require('../services/apps');
const UserService = require('../services/users');
const UncrawledAppsService = require('../services/uncrawledApps');
const UsagesUtil = require('../utils/usages');
const Boom = require('boom');

const postShortTermStats = (req, res, next) => {
    if (!Array.isArray(req.body)) {
        next(Boom.preconditionFailed('Empty ShortTermStats'));
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
            Users.findOneAndUpdate({userId: req.userId},
                {$set: {"lastStatsUpdateTime" : new Date()}},
                {upsert: true}))
            .then(() => res.sendStatus(200))
            .catch(err => next(err));
    }
};

const postAppUsages = (req, res, next) => {
    if (!Array.isArray(req.body)) {
        next(Boom.preconditionFailed('Empty AppUsages'));
        return;
    }

    console.log('postAppUsages) body length =', req.body.length);

    if (req.body.length < 1) {
        res.sendStatus(200);
    } else {
        const appUsages = req.body;
        AppService.getGameAppInfoForAnalysis(appUsages.map(appUsage => appUsage.packageName))
            .lean()
            .then(gameAppInfos => {
                console.log('count of games in requested app-usages = ', gameAppInfos.length);
                const gamePackageNames = gameAppInfos.map(appInfo => appInfo.packageName);
                const gameAppUsages = appUsages.filter(appUsage => gamePackageNames.includes(appUsage.packageName));
                const otherAppUsages = appUsages.filter(appUsage => !(gamePackageNames.includes(appUsage.packageName)));

                return Promise.all([
                    AppUsagesService.upsertAppUsages(req.user, UsagesUtil.concatWithAppInfos(gameAppUsages, gameAppInfos)),
                    UncrawledAppsService.saveApps(otherAppUsages.map(i => i.packageName))
                ]);
            })
            .then(() => res.sendStatus(200))
            .catch(err => next(err));
    }
};

const getReport = (req, res, next) => {
    console.log("getReport", "userId=", req.userId, "categoryId=", req.params.categoryId);

    const result = { totalUsedTimeRank: [], usages: [], totalUserCount: 0 };

    // 사용시간 순위
    AppUsagesService.getTotalUsedTimeOverview(req.userId, req.params.categoryId).then(res => {
        result.totalUsedTimeRank = res.ranks;
        result.totalUserCount = res.totalUserCount;

        // 요청한 유저의 앱 사용 데이터
        return AppUsagesService.aggregateAppUsageByCategory([req.userId], req.params.categoryId);
    }).then(userUsages => {
        userUsages.groupType = UserConstants.mine;
        result.usages.push(userUsages);

        // 성별+나이대 동일 유저의 앱 사용 데이터
        return getSimilarUsersAppUsagesByCategory(req.body, UserConstants.gender | UserConstants.age, req.params.categoryId);
    }).then(genderAgeAppUsages => {
        genderAgeAppUsages.groupType = UserConstants.gender | UserConstants.age;
        result.usages.push(genderAgeAppUsages);

        // 직업군 동일 유저의 앱 사용 데이터
        return getSimilarUsersAppUsagesByCategory(req.body, UserConstants.job, req.params.categoryId);
    }).then(jobAppUsages => {
        jobAppUsages.groupType = UserConstants.job;
        result.usages.push(jobAppUsages);

        res.json(result);
    }).catch(err => next(err))
};

/** start of private methods **/
const getSimilarUsersAppUsagesByCategory = (userInfo, similarType, categoryId) => {
    return UserService.getSimilarUsers(userInfo, similarType)
        .then(users => AppUsagesService.aggregateAppUsageByCategory(
            users.map(user => user.userId),
            categoryId
        ));
};
/** end of private methods **/

module.exports = {postShortTermStats, postAppUsages, getReport};