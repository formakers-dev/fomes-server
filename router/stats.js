const express = require('express');
const statsRouter = express.Router();
const ShortTermStats = require('../controller/shortTermStats');
const Auth = require('../middleware/auth');

statsRouter.post('/short', Auth.appBeeTokenVerifier, ShortTermStats.postShortTermStats);

module.exports = statsRouter;