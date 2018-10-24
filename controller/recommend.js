const AppService = require('../services/apps');
const UserService = require('../services/users');
const AppUsageService = require('../services/appUsages');


const getSimilarUserAppUsageList = (req, res) => {
    const criteria = [];

    UserService.getUser(req.userId)
        .then(user => {
            criteria.push(UserService.getAge(user.birthday) + "대");
            criteria.push(user.gender === "male" ? "남성" : "여성");
            return AppUsageService.getSimilarUsers(user, parseInt(req.query.page), parseInt(req.query.limit));
        })
        .then(appUsages => Promise.resolve(appUsages.filter(i => i.developer && i.categoryId)))
        .then(appUsages => AppService.combineAppInfos(appUsages))
        .then(appUsagesWithAppInfo => {
            res.json(appUsagesWithAppInfo.map(item => {
                return {
                    criteria: criteria,
                    app: item
                };
            }));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = { getSimilarUserAppUsageList };