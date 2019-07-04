const express = require('express');
const router = express.Router();
const BetaTestController = require('../controller/betaTests');
const Auth = require('../middleware/auth');

router.get('/', Auth.verifyAppBeeToken, BetaTestController.getBetaTestList);
router.get('/finished', Auth.verifyAppBeeToken, BetaTestController.getFinishedBetaTestList);
router.get('/detail/:id/', Auth.verifyAppBeeToken, BetaTestController.getDetailBetaTest);
router.get('/mission/:id/progress', Auth.verifyAppBeeToken, BetaTestController.getMissionProgress);

// from=external_script
router.post('/:id/complete', Auth.verify, BetaTestController.postComplete);
router.post('/target-user', Auth.verifyAPIKey, BetaTestController.postTargetUser);

module.exports = router;