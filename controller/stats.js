const User = require('../models/user').User;
const UserConstants = require('../models/user').Constants;
const UserController = require('../controller/user');
const Stats = require('./../models/shortTermStats');
const AppUsagesService = require('../services/appUsages');

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
        AppUsagesService.refreshAppUsages(req.user, req.body)
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

// '/usages/app/category/:categoryId'
const getAppUsageByCategory = (req, res) => {
    console.log("getAppUsageByCategory", "userId=", req.userId, "categoryId=", req.params.categoryId);

    const options = {
        isVerbose: req.query.verbose,
        isFold: req.query.fold
    };

    AppUsagesService.findAppUsageByCategory(req.userId, req.params.categoryId, options)
        .then(appUsage => res.json(appUsage))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

// '/usages/category'
// '/usages/category/:categoryId'
const getCategoryUsage = (req, res) => {
    console.log("getCategoryUsage", "userId=", req.userId, "categoryId=", req.params.categoryId);

    const options = {
        isVerbose: req.query.verbose,
        isFold: req.query.fold
    };

    AppUsagesService.findCategoryUsages(req.userId, req.params.categoryId, options)
        .then(categoryUsages => res.json(categoryUsages))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
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
    return UserController.getSimilarUsers(userInfo, similarType)
        .then(users => AppUsagesService.aggregateAppUsageByCategory(
            users.map(user => user.userId), categoryId)
        );
};
/** end of private methods **/

module.exports = {postShortTermStats, postAppUsages, getAppUsageByCategory, getCategoryUsage, getReport};