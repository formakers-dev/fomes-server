const ShortTermStats = require('./../models/shortTermStats');

const postShortTermStats = (req, res) => {
    ShortTermStats.findOneAndUpdate({userId: req.userId},
        {
            $push: {stats: {$each: req.body}}
        }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {postShortTermStats};