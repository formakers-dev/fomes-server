const express = require('express');
const router = express.Router();
const Controller = require('../controller/points');
const Auth = require('../middleware/auth');

router.get('/', Auth.verifyAppBeeToken, Controller.getPointRecords);

module.exports = router;