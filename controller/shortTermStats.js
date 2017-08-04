let ShortTermStats = require('./../models/shortTermStats');

let postShortTermStats = (req, res) => {
    ShortTermStats.findOneAndUpdate({userId : req.userId}, {$push: {'stats' : req.body}}, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {postShortTermStats};