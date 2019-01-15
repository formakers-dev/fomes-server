const moment = require('moment');
const Users = require('../models/users').Users;
const UserConstants = require('../models/users').Constants;

// 다른 에러 타입 많아지는 경우 통합 고려
class NickNameDuplicationError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

const getUser = (userId) => {
    return Users.findOne({userId: userId});
};

const getUserId = (email) => {
    return Users.findOne({email: email}, {userId : true});
};

const upsertUser = (userId, user) => {
    if (user.nickName) {
        return isDuplicatedNickName(userId, user.nickName)
                .then(isDuplicted => {
                    if (isDuplicted) {
                        throw new NickNameDuplicationError();
                    } else {
                        return Users.findOneAndUpdate({userId: userId}, {$set: user}, {upsert: true});
                    }
                });
    } else {
        return Users.findOneAndUpdate({userId: userId}, {$set: user}, {upsert: true});
    }
};

// similarPoint : columns of User model (plz refer to User's Constants)
const getSimilarUsers = (userInfo, similarPoint) => {
    const findQuery = {'$and': []};

    if ((similarPoint & UserConstants.gender) === UserConstants.gender) {
        findQuery['$and'].push({gender: userInfo.gender});
    }

    if ((similarPoint & UserConstants.age) === UserConstants.age) {
        const currentYear = moment().format('YYYY');
        const age = getAge(userInfo.birthday);

        findQuery['$and'].push(
            {birthday: {$gte: currentYear - age - 10 + 1}},
            {birthday: {$lte: currentYear - age + 1}}
        );
    }

    if ((similarPoint & UserConstants.job) === UserConstants.job) {
        findQuery['$and'].push({job: userInfo.job});
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

const upsertWishList = (userId, packageName) => {
    return Users.findOneAndUpdate({userId: userId}, {$addToSet: {wishList: packageName}}, {upsert: true});
};

const removeAppFromWishList = (userId, packageName) => {
    return Users.findOneAndUpdate({userId: userId}, {$pull: {wishList: packageName}});
};

const getWishList = (userId) => {
    return new Promise((resolve, reject) => {
        getUser(userId)
            .then(user => resolve(user.wishList))
            .catch(err => {
                console.error('getWishList', err);
                reject(err);
            });
    });
};

const isDuplicatedNickName = (userId, nickName) => {
    console.log("userService nickName=", nickName);
    return new Promise((resolve, reject) => {
        Users.findOne({userId: {$ne: userId}, nickName: nickName})
            .then(user => {
                if (user) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => reject(err));
    });
};

module.exports = {
    getUser,
    getUserId,
    upsertUser,
    getSimilarUsers,
    getAge,
    upsertWishList,
    removeAppFromWishList,
    getWishList,
    isDuplicatedNickName,
    NickNameDuplicationError
};