const express = require('express');
const userRouter = express.Router();
const User = require('../controller/user');

userRouter.post('/', User.upsertUser);
userRouter.post('/apps', User.postUserApps);

module.exports = userRouter;