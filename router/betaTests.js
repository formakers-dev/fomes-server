const express = require('express');
const router = express.Router();
const BetaTestController = require('../controller/betaTests');
const Auth = require('../middleware/auth');

router.get('/', Auth.appBeeTokenVerifier, BetaTestController.getBetaTestList);

router.post('/:id/complete', Auth.apiKeyVerifier, BetaTestController.postComplete);

module.exports = router;