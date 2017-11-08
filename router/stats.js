const express = require('express');
const statsRouter = express.Router();
const ShortTermStats = require('../controller/shortTermStats');
const Analyses = require('../controller/analyses');
const Auth = require('../middleware/auth');

statsRouter.route('/short')
    .post(Auth.appBeeTokenVerifier, ShortTermStats.postShortTermStats);

statsRouter.get('/short/lastUpdateStatTimestamp', Auth.appBeeTokenVerifier, ShortTermStats.getLastUpdateStatTimestamp);

statsRouter.route('/analysis/result')
    .post(Auth.appBeeTokenVerifier, Analyses.postResult);

statsRouter.get('/analysis/averageUsedMinutesPerDay', Auth.appBeeTokenVerifier, Analyses.getAverageUsedMinutesPerDay);

module.exports = statsRouter;