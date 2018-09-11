const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    userId : String,
    name: String,
    nickName: String,
    email : String,
    birthday: Number,
    job: String,
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
