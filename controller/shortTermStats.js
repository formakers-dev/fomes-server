let ShortTermStats = require('./../models/shortTermStats');

let postShortTermStats = (req, res) => {
    let shortTermStatJson = {};
    shortTermStatJson.userId = req.userId;
    shortTermStatJson.stats = req.body;

    let newShortTermStats = new ShortTermStats(shortTermStatJson);
    newShortTermStats.save((err) => {
        if(err) {
            res.send(err);
        }else {
            res.send(true);
        }
    })
};

module.exports = {postShortTermStats};