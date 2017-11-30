const express = require('express');
const router = express.Router();
const Configurations = require('../controller/configurations');

router.get('/version', Configurations.getMinAppVersionCode);

module.exports = router;