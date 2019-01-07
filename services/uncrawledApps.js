const UncrawledApps = require('../models/uncrawledApps');

const saveApps = (packageNames) => {
    const bulkOps = [];

    packageNames.forEach(packageName => {
        bulkOps.push({
            'updateOne': {
                'filter': {'packageName': packageName},
                'update': {'packageName': packageName},
                'upsert': true
            }
        });
    });

    return UncrawledApps.bulkWrite(bulkOps)
};

module.exports = {saveApps};