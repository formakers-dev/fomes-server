let LongTermStats = require('./../models/longTermStats');

const postLongTermStatsBy2years = (req, res) => {
    let longTermStatJson = {};
    longTermStatJson.userId = req.headers['x-appbee-number'];
    longTermStatJson.duration = 'yearly';
    longTermStatJson.stats = req.body;

    LongTermStats.findOneAndUpdate({$and : [{userId : longTermStatJson.userId}, {duration: longTermStatJson.duration}]}
        , { $set: longTermStatJson }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

const postLongTermStatsBy3months = (req, res) => {
    let longTermStatJson = {};
    longTermStatJson.userId = req.headers['x-appbee-number'];
    longTermStatJson.duration = 'monthly';
    longTermStatJson.stats = req.body;

    LongTermStats.findOneAndUpdate({$and : [{userId : longTermStatJson.userId}, {duration: longTermStatJson.duration}]}
        , { $set: longTermStatJson }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {postLongTermStatsBy2years, postLongTermStatsBy3months};