let ShortTermStats = require('./../models/shortTermStats');

let postShortTermStats = (req, res) => {
    let shortTermStatJson = {};
    shortTermStatJson.userId = req.userId;
    shortTermStatJson.stats = req.body;

    ShortTermStats.findOneAndUpdate({userId : shortTermStatJson.userId}, { $set: shortTermStatJson }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

let getLastUpdateStatTimestamp = (req, res) => {
    ShortTermStats.findOne({"userId" : req.userId})
        .exec()
        .then((shortTermStat) => {
            if(shortTermStat.lastUpdateStatTimestamp) {
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