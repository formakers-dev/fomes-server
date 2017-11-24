const express = require('express');
const appsRouter = express.Router();
const Apps = require('../controller/apps');
const Auth = require('../middleware/auth');

appsRouter.route('/uncrawled')
    .post(Auth.appBeeTokenVerifier, Apps.postUncrawled);

appsRouter.route('/usages')
    .post(Auth.appBeeTokenVerifier, Apps.postAppUsages);

module.exports = appsRouter;