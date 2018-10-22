const moment = require('moment');
const Users = require('../models/users').Users;
const UserConstants = require('../models/users').Constants;

// similarPoint : columns of User model (plz refer to User's Constants)
const getSimilarUsers = (userInfo, similarPoint) => {
    const findQuery = { '$and' : [] };

    if ((similarPoint & UserConstants.gender) === UserConstants.gender) {
        findQuery['$and'].push({ gender: userInfo.gender });
    }

    if ((similarPoint & UserConstants.age) === UserConstants.age) {
        const currentYear = moment().format('YYYY');
        const beforeDiff = (currentYear - userInfo.birthday) % 10;
        const afterDiff = 10 - beforeDiff;

        findQuery['$and'].push(
            { birthday: { $gte: userInfo.birthday - afterDiff + 1 } },
            { birthday: { $lte: userInfo.birthday + beforeDiff + 1 } }
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

module.exports = { getSimilarUsers };