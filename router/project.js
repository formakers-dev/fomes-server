const express = require('express');
const projectRouter = express.Router();
const Project = require('../controller/project');
const Auth = require('../middleware/auth');

projectRouter.get('/', Auth.appBeeTokenVerifier, Project.getProjectList);
projectRouter.get('/:id', Auth.appBeeTokenVerifier, Project.getProject);
projectRouter.get('/match/interviews', Auth.appBeeTokenVerifier, Project.getInterviewList);
projectRouter.get('/registered/interviews', Auth.appBeeTokenVerifier, Project.getRegisteredInterviewList);
projectRouter.get('/:id/interviews/:seq', Auth.appBeeTokenVerifier, Project.getInterview);

projectRouter.post('/:id/interviews/:seq/participate/:slotId', Auth.appBeeTokenVerifier, Project.postParticipate);
projectRouter.post('/:id/interviews/:seq/cancel/:slotId', Auth.appBeeTokenVerifier, Project.cancelParticipation);

module.exports = projectRouter;