const Posts = require('../models/posts');

const findPublishablePosts = () => {
    const currentDate = new Date();

    return Posts.find({ $and: [
        { openDate : { $lte : currentDate } },
        { closeDate : { $gte : currentDate } }
    ]}).sort({ order : 1 })
};

module.exports = {
    findPublishablePosts
};