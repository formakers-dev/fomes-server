let ShortTermStats = require('./../models/shortTermStats');

let getShortTermStats = (req, res) => {
    let query = ShortTermStats.find({email: req.params.email});
    query.exec((err, stats) => {
        if(err) {
            res.send(err);
        }else {
            res.json(stats);
        }
    })
};

let postShortTermStats = (req, res) => {
    let newShortTermStats = new ShortTermStats(req.body);
    newShortTermStats.save((err, stats) => {
        if(err) {
            res.send(err);
        }else {
            res.send(true);
        }
    })
};

module.exports = {getShortTermStats, postShortTermStats};