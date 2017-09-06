const mongoose = require('mongoose');
const userAppListSchema = new mongoose.Schema({
    userId : String,
    apps : Array
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
const userAppList = mongoose.model('user-apps', userAppListSchema);
module.exports = userAppList;