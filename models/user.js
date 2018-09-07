const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    userId : String,
    name: String,
    email : String,
    birthday: Number,
    gender: String,
    registrationToken: String,
    provider: String,
    providerId: String,
    lastStatsUpdateTime: Date,
    signUpTime: Date,
    lifeApps: Array,
});

const user = mongoose.model('users', usersSchema);
module.exports = user;