const express = require('express');
const appRouter = express.Router();
const AppController = require('../controller/apps');
const Auth = require('../middleware/auth');

appRouter.get('/:packageName', Auth.appBeeTokenVerifier, AppController.getApp);

module.exports = appRouter;