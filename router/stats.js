const express = require('express');
const statsRouter = express.Router();
const ShortTermStats = require('../controller/shortTermStats');
const LongTermStats = require('../controller/longTermStats');
const Analyses = require('../controller/analyses');
const Auth = require('../middleware/auth');

statsRouter.route('/short')
    .post(Auth.appBeeTokenVerifier, ShortTermStats.postShortTermStats);

statsRouter.get('/short/lastUpdateStatTimestamp', Auth.appBeeTokenVerifier, ShortTermStats.getLastUpdateStatTimestamp);

statsRouter.route('/long/yearly')
    .post(Auth.appBeeTokenVerifier, LongTermStats.postLongTermStatsBy2years);

statsRouter.route('/long/monthly')
    .post(Auth.appBeeTokenVerifier, LongTermStats.postLongTermStatsBy3months);

statsRouter.route('/analysis/result')
    .post(Auth.appBeeTokenVerifier, Analyses.postResult);

module.exports = statsRouter;