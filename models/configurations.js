const mongoose = require('mongoose');
const configurationsSchema = new mongoose.Schema({
    minAppVersionCode: Number,
    excludeAnalysisPackageNames: Array,
});
const configurations = mongoose.model('configurations', configurationsSchema);
module.exports = configurations;