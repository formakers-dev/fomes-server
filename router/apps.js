const express = require('express');
const appsRouter = express.Router();
const Apps = require('../controller/apps');

appsRouter.route('/info')
    .get(Apps.getInfo);

module.exports = appsRouter;