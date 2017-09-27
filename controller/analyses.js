let Analyses = require('../models/analyses');
let ShortTermStats = require('../models/shortTermStats');

let postResult = (req, res) => {
    let analysesJson = req.body;
    analysesJson.userId = req.userId;

    Analyses.findOneAndUpdate({userId: analysesJson.userId}, {$set: analysesJson}, {upsert: true})
        .exec()
        .then(() => res.send(true))
        .catch(err => res.send(err));
};

let getAverageUsedMinutesPerDay = (req, res) => {
    ShortTermStats.aggregate([
        {$match: {"userId": req.userId}},
        {$unwind: "$stats"},
        {
            $group: {
                _id: "$userId",
                minStartTime: {$min: "$stats.startTimeStamp"},
                maxEndTime: {$max: "$stats.endTimeStamp"},
                totalUsedTime: {$sum: "$stats.totalUsedTime"}
            }
        }])
        .exec()
        .then((stats) => {
            let averageUsedMinutesPerDay = 0;

            if (stats && stats.length > 0) {
                const stat = stats[0];
                const usedDays = Math.ceil((stat.maxEndTime - stat.minStartTime) / 1000 / 60 / 60 / 24);
                averageUsedMinutesPerDay = Math.floor(stat.totalUsedTime / 1000 / 60 / usedDays);
            }

            res.json(averageUsedMinutesPerDay);
        })
        .catch(err => {
            res.send(err);
        });
};

module.exports = {postResult, getAverageUsedMinutesPerDay};