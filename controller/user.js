const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserApps = require('../models/userApps');
const config = require('../config')[process.env.NODE_ENV];

let upsertUser = (req, res, next) => {
    User.findOneAndUpdate({userId : req.user.userId}, { $set: req.user }, {upsert: true})
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

let updateLastUpdateStatTimestamp = (req, res, next) => {
    User.findAndUpdate({"userId" : req.userId}, {"lastUpdateStatTimestamp" : req.lastUpdateStatTimestamp})
        .exec()
        .then(() => {
            next();
        })
        .catch((err) => {
            console.log('===updateLastUpdateStatTimestamp:Error' + err.message);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

let getLastUpdateStatTimestamp = (req, res) => {
    User.findOne({"userId" : req.userId})
        .exec()
        .then((user) => {
            if(user.lastUpdateStatTimestamp) {
                res.json(user.lastUpdateStatTimestamp);
            } else {
                res.json(0);
            }
        })
        .catch((err) => {
            console.log('===getLastUpdateStatTimestamp:Error' + err.message);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

let generateToken = (req, res) => {
    jwt.sign(req.user, config.secret, {
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

module.exports = {upsertUser, postUserApps, generateToken, updateLastUpdateStatTimestamp, getLastUpdateStatTimestamp};