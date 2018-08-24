const express = require('express');
const appsRouter = express.Router();
const Apps = require('../controller/apps');
const Auth = require('../middleware/auth');

appsRouter.post('/usages', Auth.appBeeTokenVerifier, Apps.postAppUsages);

appsRouter.get('/usages/category/:categoryId', Auth.appBeeTokenVerifier, Apps.getAppUsageByCategory);

appsRouter.get('/usages/rank/category', Auth.appBeeTokenVerifier, Apps.getCategoryUsage);

module.exports = appsRouter;