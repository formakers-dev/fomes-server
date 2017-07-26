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
    let newUserApps = new UserApps(req.body);
    newUserApps.save((err) => {
       if(err){
           res.send(err);
       } else {
           res.send(true);
       }
    });
};

module.exports = {getUserApps, postUserApps};