const express = require('express');
const userRouter = express.Router();
const User = require('../controller/user');
const Auth = require('../middleware/auth');

userRouter.post('/apps', User.postUserApps);
userRouter.get('/auth', Auth.googleTokenVerifier, User.upsertUser, User.generateToken);

module.exports = userRouter;