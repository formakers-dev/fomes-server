const { Apps } = require('../models/appUsages');

const getGameAppInfoForAnalysis = (packageNames) => {
    return Apps.find({ packageName: {$in : packageNames}, categoryId1: new RegExp(`GAME.*`)},
        { _id: false, packageName: true, categoryId1: true, developer: true});
};

module.exports = { getGameAppInfoForAnalysis };