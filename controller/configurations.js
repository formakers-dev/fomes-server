const Configurations = require('./../models/configurations');

const getMinAppVersionCode = (req, res) => {
    Configurations.findOne({})
        .exec()
        .then(configuration => res.json(configuration.minAppVersionCode))
        .catch(err => {
            console.error(err);
            res.send(err);
        });
};

const getExcludePackageNames = (req, res) => {
    Configurations.findOne({})
        .exec()
        .then(configuration => {
            res.json(configuration.excludeAnalysisPackageNames);
        })
        .catch(err => {
            console.error(err);
            res.send(err);
        });
};

module.exports = {getMinAppVersionCode, getExcludePackageNames};