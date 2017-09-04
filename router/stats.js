const express = require('express');
const statsRouter = express.Router();
const ShortTermStats = require('../controller/shortTermStats');
const LongTermStats = require('../controller/longTermStats');
const EventStats = require('../controller/eventStats');


statsRouter.route('/short')
    .post(ShortTermStats.postShortTermStats);

statsRouter.route('/event')
    .post(EventStats.postEventStats);

statsRouter.route('/long/yearly')
    .post(LongTermStats.postLongTermStatsBy2years);
statsRouter.route('/long/monthly')
    .post(LongTermStats.postLongTermStatsBy3months);
module.exports = statsRouter;