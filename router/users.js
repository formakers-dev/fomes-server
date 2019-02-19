const express = require('express');
const usersRouter = express.Router();
const Users = require('../controller/users');
const Auth = require('../middleware/auth');

usersRouter.post('/', Auth.appBeeTokenVerifier, Users.upsertUser, (req, res) => res.sendStatus(200));
usersRouter.put('/activated', Auth.appBeeTokenVerifier, Users.updateActivatedDate);
usersRouter.patch('/noti-token', Auth.appBeeTokenVerifier, Users.updateNotificationToken);

usersRouter.post('/signin', Auth.googleTokenVerifier, Users.upsertUser, Users.generateToken);
usersRouter.post('/signup', Auth.googleTokenVerifier, Users.signUpUser, Users.generateToken);
usersRouter.get('/verifyToken', Auth.appBeeTokenVerifier, (req, res) => res.sendStatus(200));
usersRouter.get('/verify/info', Auth.appBeeTokenVerifier, Users.verifyUserInfo);

usersRouter.post('/wishlist', Auth.appBeeTokenVerifier, Users.saveAppToWishList);
usersRouter.get('/wishlist', Auth.appBeeTokenVerifier, Users.getWishList);
usersRouter.delete('/wishlist/:packageName', Auth.appBeeTokenVerifier, Users.removeAppFromWishList);

module.exports = usersRouter;