const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    projectId: Number,
    customerId: String,
    name: String,
    introduce: String,
    description: String,
    description_images: Array,
    images: Array,
    apps: Array,
    interview: Object,
    interviewer: Object,
    status: String,
    isCLab: Boolean
});

module.exports = mongoose.model('projects', projectSchema);