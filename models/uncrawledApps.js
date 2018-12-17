const mongoose = require('mongoose');

const uncrawledAppsSchema = mongoose.Schema({
    packageName: String
});

const UncrawledApps = mongoose.model('uncrawled-apps', uncrawledAppsSchema);

module.exports = UncrawledApps;