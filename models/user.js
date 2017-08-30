const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    userId : String,
    firstUsedDate : String,
    lastUsedDate : String
});
const user = mongoose.model('users', usersSchema);
module.exports = user;