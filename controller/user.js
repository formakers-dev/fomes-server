const User = require('../models/user');
const UserApps = require('../models/userApps');

const upsertUser = (req, res) => {
    User.findOneAndUpdate({userId : req.body.userId}, { $set: req.body }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            console.log('===upsertUser:Error' + err.message);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

let postUserApps = (req, res) => {
    let userAppsJson = {};
    userAppsJson.userId = req.headers['x-appbee-number'];
    userAppsJson.apps = req.body;

    UserApps.findOneAndUpdate({userId : userAppsJson.userId}, { $set: userAppsJson }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {upsertUser, postUserApps};