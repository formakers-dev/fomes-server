const Users = require('../models/users').Users;
const UserConstants = require('../models/users').Constants;
const Stats = require('./../models/shortTermStats');
const AppUsagesService = require('../services/appUsages');
const AppService = require('../services/apps');
const UserService = require('../services/users');

const postShortTermStats = (req, res) => {
    if (!Array.isArray(req.body)) {
        res.sendStatus(412);
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
            .catch(err => {
                console.error(JSON.stringify(err, null, 2));
                res.sendStatus(500);
            });
    }
};

const postAppUsages = (req, res) => {
    if (!Array.isArray(req.body)) {
        res.sendStatus(412);
    } else if (req.body.length < 1) {
        res.sendStatus(200);
    } else {
        const appUsages = req.body;
        AppService.getGameAppInfoForAnalysis(appUsages.map(appUsage => appUsage.packageName))
            .lean()
            .then(appInfos => AppUsagesService.refreshAppUsages(req.user, appInfos,
                    appUsages.filter(appUsage => appInfos.map(appInfo => appInfo.packageName).includes(appUsage.packageName))))
            .then(() => res.sendStatus(200))
            .catch(err => {
                console.error(err);
                res.status(500).json({
                    success: false,
                    message: err.message
                });
            });
    }
};

const getReport = (req, res) => {
    console.log("getReport", "userId=", req.userId, "categoryId=", req.params.categoryId);

    const result = { totalUsedTimeRank: [], usages: [] };

    // 사용시간 순위
    AppUsagesService.getTotalUsedTimeRankList(req.userId, req.params.categoryId).then(ranks => {
        result.totalUsedTimeRank = ranks;

        // 요청한 유저의 앱 사용 데이터
        return AppUsagesService.aggregateAppUsageByCategory(req.userId, req.params.categoryId);
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
    }).catch(err => {
        console.error("getReport", "userId=", req.userId, "err=", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    })
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