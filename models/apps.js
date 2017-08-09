const mongoose = require('mongoose');
const eventStatsSchema = new mongoose.Schema({
    package_name: String
});
const apps = mongoose.model('apps', eventStatsSchema);
module.exports = apps;