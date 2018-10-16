const express = require('express');
const appRouter = express.Router();
const Apps = require('../controller/apps');
const Auth = require('../middleware/auth');

appRouter.get('/category/:categoryId', Auth.appBeeTokenVerifier, Apps.getApps);

module.exports = appRouter;