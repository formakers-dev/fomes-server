const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    userId : String,
    name: String,
    email : String,
    maxAge: Number,
    minAge: Number,
    gender: String,
    registrationToken: String
});
const user = mongoose.model('users', usersSchema);
module.exports = user;