let Apps = require('../models/apps');
let UncrawledApps = require('../models/uncrawledApps');
let postInfo = (req, res) => {
    Apps.find({packageName : { $in: req.body }},
        { packageName: 1, appName: 1, categoryId1: 1, categoryId2: 1, categoryName1: 1, categoryName2: 1, _id: 0 })
        .exec()
        .then((appsInfo) => {
            res.json(appsInfo);
        });
};

let postUncrawled = (req, res) => {
    const bulkOps = [ ];

    req.body.forEach(packageName => {
        const upsertDoc = {
            'updateOne': {
                'filter': { 'packageName': packageName },
                'update': { 'packageName': packageName },
                'upsert': true
            }};
        bulkOps.push(upsertDoc);
    });

    UncrawledApps.bulkWrite(bulkOps)
        .then(res.json(true))
        .catch( err => {
            console.log(JSON.stringify(err, null, 2));
            res.json(false);
        });
};

module.exports = {postInfo, postUncrawled};