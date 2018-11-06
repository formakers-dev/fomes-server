const express = require('express');
const projectRouter = express.Router();
const Projects = require('../controller/projects');
const Auth = require('../middleware/auth');

projectRouter.get('/', Auth.appBeeTokenVerifier, Projects.getProjectList);
projectRouter.get('/:id', Auth.appBeeTokenVerifier, Projects.getProject);
projectRouter.get('/match/interviews', Auth.appBeeTokenVerifier, Projects.getInterviewList);
projectRouter.get('/registered/interviews', Auth.appBeeTokenVerifier, Projects.getRegisteredInterviewList);
projectRouter.get('/:id/interviews/:seq', Auth.appBeeTokenVerifier, Projects.getInterview);

projectRouter.post('/:id/interviews/:seq/participate/:slotId', Auth.appBeeTokenVerifier, Projects.postParticipate);
projectRouter.post('/:id/interviews/:seq/cancel/:slotId', Auth.appBeeTokenVerifier, Projects.cancelParticipation);

module.exports = projectRouter;