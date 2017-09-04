const express = require('express');
const statsRouter = express.Router();
const ShortTermStats = require('../controller/shortTermStats');
const LongTermStats = require('../controller/longTermStats');
const EventStats = require('../controller/eventStats');
const Analyses = require('../controller/analyses');

statsRouter.route('/short')
    .post(ShortTermStats.postShortTermStats);

statsRouter.route('/event')
    .post(EventStats.postEventStats);

statsRouter.route('/long/yearly')
    .post(LongTermStats.postLongTermStatsBy2years);
statsRouter.route('/long/monthly')
    .post(LongTermStats.postLongTermStatsBy3months);

statsRouter.route('/analysis/result')
    .post(Analyses.postResult);

module.exports = statsRouter;