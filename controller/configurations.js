const ConfigurationsService = require('./../services/configurations');

const getMinAppVersionCode = (req, res, next) => {
    ConfigurationsService.getMinAppVersionCode()
        .then(minAppVersionCode => res.json(minAppVersionCode))
        .catch(err => next(err));
};

const getExcludePackageNames = (req, res, next) => {
    ConfigurationsService.getExcludePackageNames()
        .then(excludePackageNames => res.json(excludePackageNames))
        .catch(err => next(err));
};

module.exports = {getMinAppVersionCode, getExcludePackageNames};