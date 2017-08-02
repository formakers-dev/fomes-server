const express = require('express');
const userRouter = express.Router();
const User = require('../controller/user');
const googleTokenVerifier = require('../middleware/googleTokenVerifier');

userRouter.get('/auth', googleTokenVerifier, User.upsertUser, User.generateToken);

module.exports = userRouter;