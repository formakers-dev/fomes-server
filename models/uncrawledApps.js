const mongoose = require('mongoose');
const uncrawledAppsSchema = new mongoose.Schema({
    packageName : String
});
const uncrawledAppList = mongoose.model('uncrawled-apps', uncrawledAppsSchema);
module.exports = uncrawledAppList;