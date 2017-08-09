let UncrawledApps = require('../models/uncrawledApps');
let Apps = require('../models/apps');

let postUncrawledApps = (req) => {
    req.body.forEach(app => {
        Apps.findOne({ package_name : app.packageName}, (err, crawledApp) => {
           if(!crawledApp) {
               UncrawledApps.findOneAndUpdate({packageName: app.packageName}, {$set:app}, {upsert:true})
                   .exec()
                   .catch(err => {
                       console.log('===upsertUncrawledApps:Error' + err.message);
                   });
           }
        });
    });
};

module.exports = {postUncrawledApps};