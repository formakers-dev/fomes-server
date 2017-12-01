const express = require('express');
const appsRouter = express.Router();
const Apps = require('../controller/apps');
const Auth = require('../middleware/auth');

appsRouter.route('/usages')
    .post(Auth.appBeeTokenVerifier, Apps.postAppUsages);

module.exports = appsRouter;