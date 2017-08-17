let Apps = require('../models/apps');
let postInfo = (req, res) => {
    Apps.find({packageName : { $in: req.body.packageNames }},
        { packageName: 1, appName: 1, categoryId1: 1, categoryId2: 1, categoryName1: 1, categoryName2: 1, _id: 0 })
        .exec()
        .then((appsInfo) => {
            res.json(appsInfo);
        });
};
module.exports = {postInfo};