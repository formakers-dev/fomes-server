const express = require('express');
const appsRouter = express.Router();
const Apps = require('../controller/apps');

appsRouter.route('/info')
    .post(Apps.postInfo);

appsRouter.route('/uncrawled')
    .post(Apps.postUncrawled);

module.exports = appsRouter;