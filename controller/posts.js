const PostService = require('./../services/posts');

const getPosts = (req, res, next) => {
    PostService.findPublishablePosts()
        .then(posts => res.json(posts))
        .catch(err => next(err));
};

module.exports = {getPosts};