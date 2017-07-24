const mongoose = require('mongoose');
const userAppListSchema = new mongoose.Schema({
  email: String,
  packageName: String,
  appName: String
});
const userAppList = mongoose.model('UserAppList', userAppListSchema);
module.exports = userAppList;
