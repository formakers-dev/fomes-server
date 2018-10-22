const { Apps } = require('../models/appUsages');    // TODO : 언젠가 service로 이동해야 한다

const getApps = (req, res) => {
    const regex = `${req.params.categoryId}.*`;
    const page = req.query.page;
    const limit = req.query.limit;

    Apps.find({categoryId1: new RegExp(regex)})
        .skip((page - 1) * limit)
        .limit(limit)
        .then(apps => {
            console.log(apps.length);
            res.json(apps);
        }).catch(err => console.log(err));
};


module.exports = { getApps };