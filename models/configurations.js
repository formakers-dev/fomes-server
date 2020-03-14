const mongoose = require('mongoose');

const configurationsSchema = new mongoose.Schema({
    minAppVersionCode: Number,
    excludeAnalysisPackageNames: Array,
    betaTestProgressText: Object
});
const Configurations = mongoose.model('configurations', configurationsSchema);

const adminUsersSchema = new mongoose.Schema({
    userId: String,
});
const AdminUsers = mongoose.model('admin-users', adminUsersSchema);

module.exports = { Configurations, AdminUsers };
