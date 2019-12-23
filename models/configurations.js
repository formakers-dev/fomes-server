const mongoose = require('mongoose');

const configurationsSchema = new mongoose.Schema({
    minAppVersionCode: Number,
    excludeAnalysisPackageNames: Array,
});
const Configurations = mongoose.model('configurations', configurationsSchema);

const adminUsersSchema = new mongoose.Schema({
    userId: String,
});
const AdminUsers = mongoose.model('users-admin', adminUsersSchema);

module.exports = { Configurations, AdminUsers };