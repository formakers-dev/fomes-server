const express = require('express');
const router = express.Router();
const Posts = require('../controller/posts');

router.get('/', Posts.getPosts);
router.get('/detail/:id', Posts.getPost);

module.exports = router;