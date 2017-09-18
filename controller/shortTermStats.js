let ShortTermStats = require('./../models/shortTermStats');

let postShortTermStats = (req, res) => {
    let shortTermStatJson = {};
    shortTermStatJson.userId = req.userId
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

module.exports = {postShortTermStats};