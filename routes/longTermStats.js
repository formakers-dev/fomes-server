let LongTermStats = require('./../models/longTermStats');

const getLongTermStats = (req, res) => {
    let query = LongTermStats.find({email: req.params.email});
    query.exec((err, stats) => {
        if(err) {
            res.send(err);
        }else {
            res.json(stats);
        }
    })
};

const postLongTermStats = (req, res) => {
    let newLongTermStats = new LongTermStats(req.body);
    newLongTermStats.save((err, stats) => {
        if(err) {
            res.send(err);
        }else {
            res.send(true);
        }
    })
};

module.exports = {getLongTermStats, postLongTermStats};