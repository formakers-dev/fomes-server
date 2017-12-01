const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    userId : String,
    name: String,
    email : String,
    birthday: Number,
    gender: String,
    registrationToken: String,
    provider: String,
    providerId: String
});

const user = mongoose.model('users', usersSchema);
module.exports = user;