const Configurations = require('../models/configurations');

const getMinAppVersionCode = () => {
    return Configurations.findOne({})
        .then(configuration => Promise.resolve(configuration.minAppVersionCode))
        .catch(err => Promise.reject(err));
};

const getExcludePackageNames = () => {
    return Configurations.findOne({})
        .then(configuration => Promise.resolve(configuration.excludeAnalysisPackageNames))
        .catch(err => Promise.reject(err));
};

const getNotificationMessage = () => {
    return Configurations.findOne({})
        .then(configuration => Promise.resolve(configuration.notificationMessage))
        .catch(err => Promise.reject(err));
};

module.exports = {
    getMinAppVersionCode,
    getExcludePackageNames,
    getNotificationMessage
};