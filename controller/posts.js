const PostService = require('./../services/posts');

const getPosts = (req, res, next) => {
    PostService.findPublishablePosts()
        .then(posts => res.json(posts))
        .catch(err => next(err));
};

const getPost = (req, res, next) => {
    PostService.findPost(req.params.id)
        .then(post => res.json(post))
        .catch(err => next(err));
};

module.exports = {getPosts, getPost};