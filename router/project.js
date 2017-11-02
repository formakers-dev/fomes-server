const express = require('express');
const projectRouter = express.Router();
const Project = require('../controller/project');
const Auth = require('../middleware/auth');

projectRouter.route('/').get(Auth.appBeeTokenVerifier, Project.getProjectList);
projectRouter.route('/:id').get(Auth.appBeeTokenVerifier, Project.getProject);

module.exports = projectRouter;