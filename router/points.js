const express = require('express');
const router = express.Router();
const Controller = require('../controller/points');
const Auth = require('../middleware/auth');

router.get('/', Auth.verifyAppBeeToken, Controller.getPointRecords);
router.put('/', Auth.verifyAppBeeToken, Controller.putSavePointRecord);
router.put('/exchange', Auth.verifyAppBeeToken, Controller.putExchangePointRecord);

router.get('/available', Auth.verifyAppBeeToken, Controller.getAvailablePoint);
router.get('/accumulated', Auth.verifyAppBeeToken, Controller.getAccumulatedPoint);

module.exports = router;