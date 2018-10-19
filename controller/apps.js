const { Apps } = require('../models/appUsages');

const getApps = (req, res) => {
    const regex = `${req.params.categoryId}.*`;
    const page = req.query.page;
    const limit = req.query.limit;

    Apps.find({categoryId1: new RegExp(regex)})
        .skip((page - 1) * limit)
        .limit(limit)
        .then(apps => {
            console.log(apps.length);
            res.json(apps);
        }).catch(err => console.log(err));
};

const getGameAppInfoForAnalysis = (packageNames) => {
    return Apps.find({ packageName: {$in : packageNames}, categoryId1: new RegExp(`GAME.*`)},
        { _id: false, packageName: true, categoryId1: true, developer: true});
};

module.exports = { getApps, getGameAppInfoForAnalysis };