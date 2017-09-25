const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    userId : String,
    email : String,
    name : String,
    provider: String
});
const user = mongoose.model('users', usersSchema);
module.exports = user;