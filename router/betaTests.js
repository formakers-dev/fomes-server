const express = require('express');
const router = express.Router();
const BetaTestController = require('../controller/betaTests');
const Auth = require('../middleware/auth');

// 이거 api 네이밍 변경해야 할 것 같은데.....
router.get('/', Auth.verifyAppBeeToken, BetaTestController.getBetaTestList);
// router.get('/opened', Auth.verifyAppBeeToken, BetaTestController.getOpenedBetaTestList);
// router.get('/valid', Auth.verifyAppBeeToken, BetaTestController.getBetaTestList); // 개인 맞춤형(추천형) 인경우

router.get('/completed/count', Auth.verifyAppBeeToken, BetaTestController.getCompletedBetaTestCount);

router.get('/:id/progress', Auth.verifyAppBeeToken, BetaTestController.getProgress);
router.get('/:id/missions/:missionId/progress', Auth.verifyAppBeeToken, BetaTestController.getMissionProgress);
router.get('/:id/missions/completed', Auth.verifyAppBeeToken, BetaTestController.getCompletedMissions);

router.get('/:id/award-records', Auth.verifyAppBeeToken, BetaTestController.getAwardRecords);
router.get('/:id/award-record', Auth.verifyAppBeeToken, BetaTestController.getAwardRecord);
router.get('/:id/epilogue', Auth.verifyAppBeeToken, BetaTestController.getEpilogue);

router.get('/finished', Auth.verifyAppBeeToken, BetaTestController.getFinishedBetaTestList);
router.get('/detail/:id/', Auth.verifyAppBeeToken, BetaTestController.getDetailBetaTest);

router.get('/all/count', Auth.verifyAppBeeToken, BetaTestController.getAllBetaTestsCount);
router.get('/all/rewards/total', Auth.verifyAppBeeToken, BetaTestController.getTotalRewards);
router.get('/all/completed-users/count', Auth.verifyAppBeeToken, BetaTestController.getAccumulatedCompletedUsersCount);

router.post('/:id/attend', Auth.verifyAppBeeToken, BetaTestController.postAttend);

/** from=external_script **/
router.post('/:id/missions/:missionId/complete', Auth.verify, BetaTestController.postMissionComplete);
router.post('/:id/complete', Auth.verify, BetaTestController.postComplete);
router.post('/target-user', Auth.verifyAPIKey, BetaTestController.postTargetUser);

module.exports = router;
