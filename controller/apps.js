const UncrawledApps = require('../models/uncrawledApps');
const AppUsages = require('../models/appUsages');

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
    if (!Array.isArray(req.body)) {
        res.sendStatus(400);
    } else if (req.body.length < 1) {
        res.json(true);
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
                res.json(false);
            } else {
                res.json(true);
            }
        });
    }
};

module.exports = {postUncrawled, postAppUsages};