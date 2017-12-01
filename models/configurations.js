const mongoose = require('mongoose');
const configurationsSchema = new mongoose.Schema({
    minAppVersionCode: Number
});
const configurations = mongoose.model('configurations', configurationsSchema);
module.exports = configurations;