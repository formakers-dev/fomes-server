const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserApps = require('../models/userApps');
const config = require('../config')[process.env.NODE_ENV];

let upsertUser = (req, res, next) => {
    User.findOneAndUpdate({userId : req.body.userId}, { $set: req.body }, {upsert: true})
        .exec()
        .then(() => {
            next();
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
    userAppsJson.userId = req.userId;
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

let generateToken = (req, res) => {
    jwt.sign(req.body, config.secret, {
        expiresIn: '7d',
        issuer: 'appbee.com',
        subject: 'AppBeeAuth'
    }, (err, newToken) => {
        if(err) {
            console.log("====generateToken:Error" + err.message);
            res.status(403).json({
                success: false,
                message: err.message
            });
        } else {
            res.json(newToken);
        }
    });
};


module.exports = {upsertUser, postUserApps, generateToken};