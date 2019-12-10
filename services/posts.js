const mongoose = require('mongoose');
const Posts = require('../models/posts');
const ObjectId = mongoose.Types.ObjectId;

const findPublishablePosts = () => {
    const currentDate = new Date();

    return Posts.find({ $and: [
        { openDate : { $lte : currentDate } },
        { closeDate : { $gte : currentDate } }
    ]}).sort({ order : 1 })
};

const findPost = (id) => {
    return Posts.findOne({ _id : ObjectId(id) })
};

module.exports = {
    findPublishablePosts,
    findPost,
};