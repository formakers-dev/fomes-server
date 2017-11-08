const express = require('express');
const appsRouter = express.Router();
const Apps = require('../controller/apps');
const Auth = require('../middleware/auth');

appsRouter.route('/info')
    .post(Auth.appBeeTokenVerifier, Apps.getInfo);

appsRouter.route('/uncrawled')
    .post(Auth.appBeeTokenVerifier, Apps.postUncrawled);

module.exports = appsRouter;