let LongTermStats = require('./../models/longTermStats');

const postLongTermStats = (req, res) => {
    let longTermStatJson = {};
    longTermStatJson.userId = req.headers['x-appbee-number'];
    longTermStatJson.stats = req.body;

    LongTermStats.findOneAndUpdate({userId : req.userId}, { $set: longTermStatJson }, {upsert: true})
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = {postLongTermStats};