const express = require('express');
const appsRouter = express.Router();
const UserApps = require('../controller/userApps');
const UncrawledApps = require('../controller/uncrawledApps');

appsRouter.route('/')
    .get(UserApps.getUserApps)
    .post(UserApps.postUserApps, UncrawledApps.postUncrawledApps);

module.exports = appsRouter;