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

let getOverview = (req, res) => {
    ShortTermStats.aggregate([
        {$match: {"userId": req.userId}},
        {$unwind: "$stats"},
        {
            $group: {
                _id: "$stats.packageName",
                minStartTime: {$min: "$stats.startTimeStamp"},
                maxEndTime: {$max: "$stats.endTimeStamp"},
                totalUsedTime: {$sum: "$stats.totalUsedTime"}
            }
        },
        {$sort: {totalUsedTime: -1}}])
        .exec()
        .then((stats) => {
            let mostUsedPackageName = "";
            let sumOfTotalUsedTime = 0;
            let averageUsedMinutesPerDay = 0;

            if (stats && stats.length > 0) {
                mostUsedPackageName = stats[0]._id;

                let startTime = 9999999999999;
                let endTime = 0;
                stats.forEach(stat => {
                    startTime = Math.min(startTime, stat.minStartTime);
                    endTime = Math.max(endTime, stat.maxEndTime);
                    sumOfTotalUsedTime += stat.totalUsedTime;
                });

                const usedDays = Math.ceil((endTime - startTime) / 1000 / 60 / 60 / 24);
                averageUsedMinutesPerDay = Math.floor(sumOfTotalUsedTime / usedDays);
            }

            res.json({
                mostUsedApp: mostUsedPackageName,
                averageUsedMinutesPerDay: averageUsedMinutesPerDay
            });

        })
        .catch(err => {
            res.send(err);
        });
};

module.exports = {postResult, getOverview};