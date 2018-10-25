const express = require('express');
const usersRouter = express.Router();
const Users = require('../controller/users');
const Auth = require('../middleware/auth');

usersRouter.post('/', Auth.appBeeTokenVerifier, Users.upsertUser, (req, res) => res.sendStatus(200));
usersRouter.post('/signin', Auth.googleTokenVerifier, Users.upsertUser, Users.generateToken);
usersRouter.post('/signup', Auth.googleTokenVerifier, Users.signUpUser, Users.generateToken);
usersRouter.post('/wishlist', Auth.appBeeTokenVerifier, Users.saveAppToWishList);
usersRouter.get('/verifyToken', Auth.appBeeTokenVerifier, (req, res) => res.sendStatus(200));
usersRouter.get('/verifyInvitationCode/:code', Users.verifyInvitationCode);

module.exports = usersRouter;