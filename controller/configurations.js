const Configurations = require('./../models/configurations');

const getMinAppVersionCode = (req, res) => {
    Configurations.findOne({}).select('minAppVersionCode')
        .exec()
        .then(configuration => res.send({
            version: configuration.minAppVersionCode
        }))
        .catch(err => {
            console.log(err);
            res.send(err);
        });
};

module.exports = {getMinAppVersionCode};