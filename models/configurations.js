const mongoose = require('mongoose');
const configurationsSchema = new mongoose.Schema({
    minAppVersionCode: Number,
    excludeAnalysisPackageNames: Array,
    notificationMessage : {
        betaTest : {
            completeTitle : String,
            completeSubTitle : String,
        }
    },
});
const configurations = mongoose.model('configurations', configurationsSchema);
module.exports = configurations;