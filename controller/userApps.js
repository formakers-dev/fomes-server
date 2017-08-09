let UserApps = require('../models/userApps');

let getUserApps = (req, res) => {
    let query = UserApps.find({userId: req.params.userId});
    query.exec((err, userApps) => {
        if(err) {
            res.send(err);
        } else{
            res.json(userApps);
        }
    })
};

let postUserApps = (req, res, next) => {
    let userAppsJson = {};
    userAppsJson.userId = req.userId;
    userAppsJson.apps = req.body;

    UserApps.findOneAndUpdate({userId : req.userId}, { $set: userAppsJson }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
            next();
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {getUserApps, postUserApps};