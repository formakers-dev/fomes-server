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

usersSchema.statics.getGenderName = (genderNumberCode) => {
    switch (genderNumberCode) {
        case 0:
            return "male";
        case 1:
            return "female";
        default:
            return "other";
    }
};

const user = mongoose.model('users', usersSchema);
module.exports = user;