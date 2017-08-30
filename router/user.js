const express = require('express');
const userRouter = express.Router();
const User = require('../controller/user');

userRouter.get('/auth', User.upsertUser);
userRouter.post('/apps', User.postUserApps);

module.exports = userRouter;