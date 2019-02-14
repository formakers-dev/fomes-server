const express = require('express');
const router = express.Router();
const Posts = require('../controller/posts');

router.get('/', Posts.getPosts);

module.exports = router;