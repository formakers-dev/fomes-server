let LongTermStats = require('./../models/longTermStats');

const postLongTermStats = (req, res) => {
    let longTermStatJson = {};
    longTermStatJson.userId = req.params.userId;
    longTermStatJson.stats = req.body;

    let newLongTermStats = new LongTermStats(longTermStatJson);
    newLongTermStats.save((err) => {
        if(err) {
            res.send(err);
        }else {
            res.send(true);
        }
    });
};

module.exports = {postLongTermStats};