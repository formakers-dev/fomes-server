const express = require('express');
const projectRouter = express.Router();
const Project = require('../controller/project');
const Auth = require('../middleware/auth');

projectRouter.route('/').get(Auth.appBeeTokenVerifier, Project.getProjectList);
projectRouter.route('/interviews').get(Auth.appBeeTokenVerifier, Project.getInterview);
projectRouter.route('/:id').get(Auth.appBeeTokenVerifier, Project.getProject);
projectRouter.route('/:id/:seq/participate').post(Auth.appBeeTokenVerifier, Project.postParticipate);

module.exports = projectRouter;