const express = require('express');
const userRouter = express.Router();
const User = require('../controller/user');
const Auth = require('../middleware/auth');

userRouter.post('/', Auth.appBeeTokenVerifier, User.upsertUser, (req, res) => res.json(true));
userRouter.get('/auth', Auth.googleTokenVerifier, User.upsertUser, User.generateToken);
userRouter.get('/verifyInvitationCode/:code', User.verifyInvitationCode);

module.exports = userRouter;