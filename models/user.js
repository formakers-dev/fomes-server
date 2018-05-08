const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const signUpCodeSchema = new Schema({
    type: String,
    value: String,
});

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
    signUpCode: signUpCodeSchema,
});

const user = mongoose.model('users', usersSchema);
module.exports = user;