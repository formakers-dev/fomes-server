const express = require('express');
const userRouter = express.Router();
const User = require('../controller/user');

userRouter.post('/', User.postUser);

module.exports = userRouter;