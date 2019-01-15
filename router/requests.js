const express = require('express');
const router = express.Router();
const RequestController = require('../controller/requests');
const Auth = require('../middleware/auth');

router.get('/', Auth.appBeeTokenVerifier, RequestController.getRequestList);

router.post('/:id/complete', Auth.apiKeyVerifier, RequestController.postComplete);

module.exports = router;