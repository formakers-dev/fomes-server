const mongoose = require('mongoose');
const appSchema = new mongoose.Schema({
    packageName: String,
    appName: String,
    categoryId1: String,
    categoryId2: String,
    categoryName1: String,
    categoryName2: String
});
const apps = mongoose.model('apps', appSchema);
module.exports = apps;