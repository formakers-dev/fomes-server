const express = require('express');
const Router = express.Router();
const Auth = require('../middleware/auth');
const Recommend = require('../controller/recommend');

Router.get('/apps/:categoryId', Auth.verifyAppBeeToken, Recommend.getRecommendApps);

module.exports = Router;