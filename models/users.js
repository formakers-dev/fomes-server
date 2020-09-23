const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Constants = {
    all: 0xFFFFFFFF,
    mine: 0x00000001,
    gender: 0x00000002,
    age: 0x00000004,
    job: 0x00000008,
};

const Device = {
    manufacturer : String,
    model : String,
    osVersion : Number,
};

const usersSchema = new Schema({
    userId : String,
    name: String,
    nickName: String,
    email : String,
    birthday: Number,
    job: Number,
    gender: String,
    registrationToken: String,
    provider: String,
    providerId: String,
    lastStatsUpdateTime: Date,
    signUpTime: Date,
    activatedDate: Date,
    lifeApps: Array,
    wishList: Array,
    appVersion: String,
    device: Device,
    favoritePlatforms: Array,
    favoriteGenres: Array,
    leastFavoriteGenres: Array,
    feedbackStyles: Array,
    monthlyPayment: Number,
    userInfoUpdateVersion: Number,
});

const Users = mongoose.model('users', usersSchema);
module.exports = { Users, Constants, Device };
