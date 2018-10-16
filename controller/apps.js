const { Apps } = require('../models/appUsages');

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