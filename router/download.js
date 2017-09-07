const express = require('express');
const downloadRouter = express.Router();
const Download = require('../controller/download');

downloadRouter.get('/', Download.insertDownloadHistory);

module.exports = downloadRouter;