const express = require('express');
const statsRouter = express.Router();
const Stats = require('../controller/stats');
const Auth = require('../middleware/auth');
const Users = require('../controller/users');

statsRouter.post('/short', Auth.appBeeTokenVerifier, Stats.postShortTermStats);
statsRouter.post('/usages/app', Auth.appBeeTokenVerifier, Users.getUser, Stats.postAppUsages);
statsRouter.get('/usages/app/category/:categoryId', Auth.appBeeTokenVerifier, Stats.getAppUsageByCategory);
statsRouter.get('/usages/category', Auth.appBeeTokenVerifier, Stats.getCategoryUsage);
statsRouter.get('/usages/category/:categoryId', Auth.appBeeTokenVerifier, Stats.getCategoryUsage);

statsRouter.post('/report/category/:categoryId/recent', Auth.appBeeTokenVerifier, Stats.getReport);

module.exports = statsRouter;