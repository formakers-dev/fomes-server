const User = require('../models/user');
const ShortTermStats = require('./../models/shortTermStats');

const postShortTermStats = (req, res) => {
    if (!Array.isArray(req.body)) {
        res.sendStatus(400);
    } else if (req.body.length < 1) {
        res.sendStatus(200);
    } else {
        const userId = req.userId;
        const bulkOps = [];

        req.body.forEach(shortTermStat => {
            shortTermStat.userId = userId;
            bulkOps.push({
                'insertOne': {
                    'document': shortTermStat,
                }
            });
        });

        ShortTermStats.bulkWrite(bulkOps).then(() =>
            User.findOneAndUpdate({userId: req.userId},
                {$set: {"lastStatsUpdateTime" : new Date()}},
                {upsert: true})
        ).then(() => res.sendStatus(200))
        .catch(err => {
                console.log(JSON.stringify(err, null, 2));
                res.sendStatus(500);
            });
    }
};

module.exports = {postShortTermStats};