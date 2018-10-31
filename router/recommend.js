const express = require('express');
const Router = express.Router();
const Auth = require('../middleware/auth');
const Recommend = require('../controller/recommend');

Router.get('/similar/demographic', Auth.appBeeTokenVerifier, Recommend.getSimilarUserAppUsageList);
Router.get('/favorite/category/:categoryId', Auth.appBeeTokenVerifier, Recommend.getFavoriteCategoryAppUsageList);

module.exports = Router;