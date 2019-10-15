const express = require('express');
const router = express.Router();
const BetaTestController = require('../controller/betaTests');
const Auth = require('../middleware/auth');

// 이거 api 네이밍 변경해야 할 것 같은데.....
router.get('/', Auth.verifyAppBeeToken, BetaTestController.getBetaTestList);
router.get('/:id/progress', Auth.verifyAppBeeToken, BetaTestController.getProgress);
router.get('/finished', Auth.verifyAppBeeToken, BetaTestController.getFinishedBetaTestList);
// 이거 detail 빠져도 되지 않을까?
router.get('/detail/:id/', Auth.verifyAppBeeToken, BetaTestController.getDetailBetaTest);
// 이거 :testId/mission/:id/progress 아닐까? 정황상 어차피 missionId가 유일키이긴 하지만...
router.get('/mission/:id/progress', Auth.verifyAppBeeToken, BetaTestController.getMissionProgress);
router.get('/all/count', Auth.verifyAppBeeToken, BetaTestController.getAllBetaTestsCount);
router.get('/all/rewards/total', Auth.verifyAppBeeToken, BetaTestController.getTotalRewards);

// from=external_script
router.post('/:id/complete', Auth.verify, BetaTestController.postComplete);
router.post('/target-user', Auth.verifyAPIKey, BetaTestController.postTargetUser);

module.exports = router;