const express = require('express');
const appsRouter = express.Router();
const UserApps = require('../controller/userApps');

appsRouter.route('/')
    .get(UserApps.getUserApps)
    .post(UserApps.postUserApps);

module.exports = appsRouter;