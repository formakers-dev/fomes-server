const { AppUsages } = require('../models/appUsages');

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
    const regex = `/store/apps/category/${req.params.categoryId}.*`;

    AppUsages.find({userId: req.userId})
        .populate('appInfo')
        .lean()
        .then(appusages => {
            res.json(appusages.filter(appusage => appusage.appInfo !== null && appusage.appInfo !== undefined
                    && new RegExp(regex).test(appusage.appInfo.categoryId1))
                .sort((a, b) => b.totalUsedTime > a.totalUsedTime));
        }).catch(err => console.log(err));
};

module.exports = {postAppUsages, getAppUsageByCategory};