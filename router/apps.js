const express = require('express');
const appsRouter = express.Router();
const Apps = require('../controller/apps');

appsRouter.route('/info')
    .post(Apps.postInfo);

module.exports = appsRouter;