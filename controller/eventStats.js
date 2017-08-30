let EventStats = require('./../models/eventStats');

let postEventStats = (req, res) => {
    let eventStatJson = {};
    eventStatJson.userId = req.headers['x-appbee-number'];
    eventStatJson.stats = req.body;

    let newEventStats = new EventStats(eventStatJson);
    newEventStats.save((err) => {
        if(err) {
            res.send(err);
        }else {
            res.send(true);
        }
    })
};

module.exports = {postEventStats};