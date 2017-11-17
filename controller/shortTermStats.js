const ShortTermStats = require('./../models/shortTermStats');

const postShortTermStats = (req, res) => {
    if (!Array.isArray(req.body)) {
        res.sendStatus(400);
    } else if (req.body.length < 1) {
        res.json(true);
    } else {
        const userId = req.userId;
        const shortTermStatArray = [];

        req.body.forEach((shortTermStat) => {
            shortTermStat.userId = userId;
            shortTermStatArray.push(shortTermStat);
        });

        ShortTermStats.create(shortTermStatArray, (err) => {
            if (err) {
                res.json(false);
            } else {
                res.json(true);
            }
        });
    }
};

module.exports = {postShortTermStats};