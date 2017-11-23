const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    projectId: Number,
    customerId: String,
    name: String,
    introduce: String,
    description: String,
    descriptionImages: Array,
    images: Array,
    apps: Array,
    interviews: Array,
    interviewer: Object,
    status: String
});

module.exports = mongoose.model('projects', projectSchema);