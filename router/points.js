const express = require('express');
const router = express.Router();
const Controller = require('../controller/points');
const Auth = require('../middleware/auth');

router.get('/', Auth.verifyAppBeeToken, Controller.getPointRecords);
router.put('/', Auth.verifyAppBeeToken, Controller.putPointRecord);

router.get('/available', Auth.verifyAppBeeToken, Controller.getAvailablePoint);

module.exports = router;