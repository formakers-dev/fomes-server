const {Configurations, AdminUsers} = require('../models/configurations');

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

const getAdminUserIds = () => {
    return AdminUsers.find({})
        .then(adminUsers => Promise.resolve(adminUsers.map(user => user.userId)))
        .catch(err => Promise.reject(err));
};

const getBetaTestProgressText = () => {
    return Configurations.findOne({})
        .then(configuration => Promise.resolve(configuration.betaTestProgressText))
        .catch(err => Promise.reject(err));
};

module.exports = {
    getMinAppVersionCode,
    getExcludePackageNames,
    getAdminUserIds,
    getBetaTestProgressText
};
