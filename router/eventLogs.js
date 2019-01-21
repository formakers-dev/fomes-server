const express = require('express');
const router = express.Router();
const EventLogsController = require('../controller/eventLogs');
const Auth = require('../middleware/auth');

router.post('/', Auth.appBeeTokenVerifier, EventLogsController.postEventLog);

module.exports = router;