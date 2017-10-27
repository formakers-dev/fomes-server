const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    projectId: String,
    customerId: String,
    name: String,
    introduce: String,
    images: Array,
    apps: Array,
    interviewer_introduce: String,
    description: String,
    description_images: Array,
    interview: Object,
    status: Number
});

module.exports = mongoose.model('projects', projectSchema);