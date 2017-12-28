const express = require('express');
const userRouter = express.Router();
const User = require('../controller/user');
const Auth = require('../middleware/auth');

userRouter.post('/', Auth.appBeeTokenVerifier, User.upsertUser, (req, res) => res.sendStatus(200));
userRouter.post('/auth', Auth.googleTokenVerifier, User.upsertUser, User.generateToken);
userRouter.get('/verifyToken', Auth.appBeeTokenVerifier, (req, res) => res.sendStatus(200));
userRouter.get('/verifyInvitationCode/:code', User.verifyInvitationCode);

module.exports = userRouter;