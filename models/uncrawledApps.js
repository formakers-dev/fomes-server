const mongoose = require('mongoose');
const uncrawledAppsSchema = new mongoose.Schema({
    packageName : String
});
const uncrawledApps = mongoose.model('uncrawled-apps', uncrawledAppsSchema);
module.exports = uncrawledApps;