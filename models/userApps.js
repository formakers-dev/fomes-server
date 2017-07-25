const mongoose = require('mongoose');
const userAppListSchema = new mongoose.Schema({
    email: String,
    apps : Array
});
const userAppList = mongoose.model('user-apps', userAppListSchema);
module.exports = userAppList;