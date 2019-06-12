const express = require('express');
const router = express.Router();
const Configurations = require('../controller/configurations');
const Auth = require('../middleware/auth');

router.get('/version', Configurations.getMinAppVersionCode);
router.get('/excludePackageNames', Auth.verifyAppBeeToken, Configurations.getExcludePackageNames);

module.exports = router;