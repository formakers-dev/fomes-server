const express = require('express');
const statsRouter = express.Router();
const Stats = require('../controller/stats');
const Auth = require('../middleware/auth');

statsRouter.post('/short', Auth.appBeeTokenVerifier, Stats.postShortTermStats);
statsRouter.post('/usages/app', Auth.appBeeTokenVerifier, Stats.postAppUsages);
statsRouter.get('/usages/app/category/:categoryId', Auth.appBeeTokenVerifier, Stats.getAppUsageByCategory);
statsRouter.get('/usages/category', Auth.appBeeTokenVerifier, Stats.getCategoryUsage);

module.exports = statsRouter;