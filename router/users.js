const express = require('express');
const usersRouter = express.Router();
const Users = require('../controller/users');
const Auth = require('../middleware/auth');

usersRouter.post('/', Auth.verifyAppBeeToken, Users.upsertUser, (req, res) => res.sendStatus(200));
usersRouter.put('/activated', Auth.verifyAppBeeToken, Users.updateActivatedDate);
usersRouter.patch('/noti-token', Auth.verifyAppBeeToken, Users.updateNotificationToken);

usersRouter.post('/signin', Auth.verifyGoogleToken, Users.upsertUser, Users.generateToken);
usersRouter.post('/signup', Auth.verifyGoogleToken, Users.signUpUser, Users.generateToken);
usersRouter.get('/verifyToken', Auth.verifyAppBeeToken, (req, res) => res.sendStatus(200));
usersRouter.get('/verify/info', Auth.verifyAppBeeToken, Users.verifyUserInfo);

usersRouter.post('/wishlist', Auth.verifyAppBeeToken, Users.saveAppToWishList);
usersRouter.get('/wishlist', Auth.verifyAppBeeToken, Users.getWishList);
usersRouter.delete('/wishlist/:packageName', Auth.verifyAppBeeToken, Users.removeAppFromWishList);

module.exports = usersRouter;