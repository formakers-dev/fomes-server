let EventStats = require('./../models/eventStats');

let postEventStats = (req, res) => {
    let eventStatJson = {};
    eventStatJson.userId = req.headers['x-appbee-number'];
    eventStatJson.stats = req.body;

    EventStats.findOneAndUpdate({userId : eventStatJson.userId}, {$set : eventStatJson}, {upsert : true})
        .exec()
        .then(() => res.send(true))
        .catch(err => res.send(err));
};

module.exports = {postEventStats};