let UserApps = require('../models/userApps');

let getUserApps = (req, res) => {
    let query = UserApps.find({userId: req.params.userId});
    query.exec((err, userApps) => {
        if(err) {
            res.send(err);
        } else{
            res.json(userApps);
        }
    })
};

let postUserApps = (req, res) => {
    let userAppsJson = {};
    userAppsJson.userId = req.userId;
    userAppsJson.apps = req.body;
    let newUserApps = new UserApps(userAppsJson);
    newUserApps.save((err) => {
       if(err){
           res.send(err);
       } else {
           res.send(true);
       }
    });
};

module.exports = {getUserApps, postUserApps};