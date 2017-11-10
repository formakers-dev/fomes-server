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
        const upsertDoc = {
            'updateOne': {
                'filter': {'packageName': packageName},
                'update': {'packageName': packageName},
                'upsert': true
            }
        };
        bulkOps.push(upsertDoc);
    });

    UncrawledApps.bulkWrite(bulkOps)
        .then(res.json(true))
        .catch(err => {
            console.log(JSON.stringify(err, null, 2));
            res.json(false);
        });
};

const postAppUsages = (req, res) => {
    const data = req.body;
    AppUsages.bulkWrite(
        data.map(appUsage => {
            return {
                updateOne: {
                    "filter": {"userId": req.userId, "packageName": appUsage.packageName},
                    "update": {$set: {"totalUsedTime": appUsage.totalUsedTime}},
                    "upsert": true
                }
            }
        })
    );
    AppUsages.findOneAndUpdate({$and: [{packageName: ''}, {'users.userId': req.userId}]}, {$set: req.body})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {getInfo, postUncrawled, postAppUsages};