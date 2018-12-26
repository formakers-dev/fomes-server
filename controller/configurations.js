const Configurations = require('./../models/configurations');

const getMinAppVersionCode = (req, res, next) => {
    Configurations.findOne({})
        .exec()
        .then(configuration => res.json(configuration.minAppVersionCode))
        .catch(err => next(err));
};

const getExcludePackageNames = (req, res, next) => {
    Configurations.findOne({})
        .exec()
        .then(configuration => res.json(configuration.excludeAnalysisPackageNames))
        .catch(err => next(err));
};

module.exports = {getMinAppVersionCode, getExcludePackageNames};