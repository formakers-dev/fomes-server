const express = require('express');
const Router = express.Router();
const Auth = require('../middleware/auth');
const Recommend = require('../controller/recommend');

Router.get('/similar/demographic', Auth.appBeeTokenVerifier, Recommend.getSimilarUserAppUsageList);

module.exports = Router;