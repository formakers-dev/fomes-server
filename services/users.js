const moment = require('moment');
const Users = require('../models/users').Users;
const UserConstants = require('../models/users').Constants;

const getUser = (userId) => {
    return Users.findOne({userId: userId});
};

// similarPoint : columns of User model (plz refer to User's Constants)
const getSimilarUsers = (userInfo, similarPoint) => {
    const findQuery = { '$and' : [] };

    if ((similarPoint & UserConstants.gender) === UserConstants.gender) {
        findQuery['$and'].push({ gender: userInfo.gender });
    }

    if ((similarPoint & UserConstants.age) === UserConstants.age) {
        const currentYear = moment().format('YYYY');
        const age = getAge(userInfo.birthday);

        findQuery['$and'].push(
            { birthday: { $gte: currentYear - age - 10 + 1 } },
            { birthday: { $lte: currentYear - age + 1 } }
        );
    }

    if ((similarPoint & UserConstants.job) === UserConstants.job) {
        findQuery['$and'].push({ job: userInfo.job });
    }

    if (findQuery['$and'].length <= 0) {
        const errorMessage = 'Please add similarPoint!';
        console.error("getSimilarUsers", "userId=", userId, "err=", errorMessage);
        return new Promise((resolve, reject) => reject(errorMessage));
    }

    return Users.find(findQuery);
};

// utils...? model...?????
const getAge = (birthday) => {
    const currentYear = moment().format('YYYY');
    return Math.floor((currentYear - birthday) / 10) * 10;
};

const upsertWishList = (userId, app) => {
    return Users.findOneAndUpdate({ userId: userId }, { $addToSet: { wishList: app } }, { upsert: true });
};

module.exports = { getUser, getSimilarUsers, getAge, upsertWishList };