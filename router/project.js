const express = require('express');
const projectRouter = express.Router();
const Project = require('../controller/project');

projectRouter.route('/all').get(Project.getAllProjects);
projectRouter.route('/').get(Project.getProject);

module.exports = projectRouter;