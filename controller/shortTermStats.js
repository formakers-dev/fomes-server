const ShortTermStats = require('./../models/shortTermStats');

const postShortTermStats = (req, res) => {
    ShortTermStats.findOneAndUpdate({userId: req.userId},
        {
            $set: {lastUpdateStatTimestamp: req.headers['x-last-updated-time']},
            $addToSet: {stats: {$each: req.body}}
        }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

const getLastUpdateStatTimestamp = (req, res) => {
    ShortTermStats.findOne({"userId": req.userId})
        .exec()
        .then((shortTermStat) => {
            if (shortTermStat && shortTermStat.lastUpdateStatTimestamp) {
                res.json(shortTermStat.lastUpdateStatTimestamp);
            } else {
                res.json(0);
            }
        })
        .catch((err) => {
            console.log('===getLastUpdateStatTimestamp:Error' + err.message);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = {postShortTermStats, getLastUpdateStatTimestamp};