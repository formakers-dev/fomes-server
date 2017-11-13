const Apps = require('../models/apps');
const UncrawledApps = require('../models/uncrawledApps');
const AppUsages = require('../models/appUsages');
const getInfo = (req, res) => {
    Apps.find({packageName: {$in: req.body}},
        {packageName: 1, appName: 1, categoryId1: 1, categoryId2: 1, categoryName1: 1, categoryName2: 1, _id: 0})
        .exec()
        .then((appsInfo) => {
            res.json(appsInfo);
        });
};

const postUncrawled = (req, res) => {
    const bulkOps = [];

    req.body.forEach(packageName => {
        bulkOps.push({
            'updateOne': {
                'filter': {'packageName': packageName},
                'update': {'packageName': packageName},
                'upsert': true
            }
        });
    });

    UncrawledApps.bulkWrite(bulkOps, err => {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
            res.json(false);
        } else {
            res.json(true);
        }
    });
};

const postAppUsages = (req, res) => {
    const bulkOps = [];

    req.body.forEach(appUsage => {
        bulkOps.push({
            'updateOne': {
                "filter": {"userId": req.userId, "packageName": appUsage.packageName},
                "update": {"totalUsedTime": appUsage.totalUsedTime},
                "upsert": true
            }
        });
    });

    AppUsages.bulkWrite(bulkOps, err => {
        if (err) {
            console.log(err);
            res.json(false);
        } else {
            res.json(true);
        }
    });
};

module.exports = {getInfo, postUncrawled, postAppUsages};