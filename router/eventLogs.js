const express = require('express');
const router = express.Router();
const EventLogsController = require('../controller/eventLogs');
const Auth = require('../middleware/auth');

router.post('/', Auth.decodeAppBeeTokenWithoutVerify, EventLogsController.postEventLog);

module.exports = router;