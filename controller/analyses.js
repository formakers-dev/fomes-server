let Analyses = require('../models/analyses');

let postResult = (req, res) => {
    let analysesJson = req.body;
    analysesJson.userId = req.userId;

    Analyses.findOneAndUpdate({userId : analysesJson.userId}, { $set : analysesJson }, {upsert : true})
        .exec()
        .then(() => res.send(true))
        .catch(err => res.send(err));
};

module.exports = {postResult};