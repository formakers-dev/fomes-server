const express = require('express');
const statsRouter = express.Router();
const Stats = require('../controller/stats');
const Auth = require('../middleware/auth');
const Users = require('../controller/users');

statsRouter.post('/short', Auth.verifyAppBeeToken, Stats.postShortTermStats);
statsRouter.post('/usages/app', Auth.verifyAppBeeToken, Users.getUser, Stats.postAppUsages);
statsRouter.post('/report/category/:categoryId/recent', Auth.verifyAppBeeToken, Stats.getReport);

module.exports = statsRouter;