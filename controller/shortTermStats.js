const ShortTermStats = require('./../models/shortTermStats');

const postShortTermStats = (req, res) => {
    if (!Array.isArray(req.body)) {
        res.sendStatus(400);
    } else if (req.body.length < 1) {
        res.json(true);
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

        ShortTermStats.bulkWrite(bulkOps, err => {
            if (err) {
                console.log(JSON.stringify(err, null, 2));
                res.json(false);
            } else {
                res.json(true);
            }
        });
    }
};

module.exports = {postShortTermStats};