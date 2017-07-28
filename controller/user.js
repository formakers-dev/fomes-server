let User = require('../models/user');

let postUser = (req, res) => {
    let newUser = new User(req.body);
    newUser.save((err) => {
        if(err){
            res.send(err);
        } else {
            res.send(true);
        }
    });
};

module.exports = {postUser};