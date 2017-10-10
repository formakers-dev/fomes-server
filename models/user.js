const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    userId : String,
    registrationToken: String
});
const user = mongoose.model('users', usersSchema);
module.exports = user;