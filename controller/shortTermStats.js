let ShortTermStats = require('./../models/shortTermStats');

let postShortTermStats = (req, res) => {
    ShortTermStats.findOneAndUpdate({userId : req.userId}, {$addToSet: {'stats' : {$each : req.body}}}, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {postShortTermStats};