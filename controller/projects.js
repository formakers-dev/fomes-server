const Projects = require('../models/projects');
const ParticipationHistories = require('../models/participationHistories');
const Boom = require('boom');

const getProject = (req, res, next) => {
    const projectId = parseInt(req.params.id);

    Projects.findOne({projectId: projectId, status: 'registered'})
        .select('-interviews')
        .then(project => res.json(project))
        .catch(err => next(err));
};

const getProjectList = (req, res, next) => {
    Projects.find({status: 'registered'})
        .select('-interviews')
        .sort({projectId: 1})
        .then(projects => res.json(projects))
        .catch(err => next(err));
};

const getInterview = (req, res, next) => {
    const userId = req.userId;

    Projects.aggregate([
        {$match: {projectId: Number(req.params.id), status: 'registered'}},
        {$unwind: '$interviews'},
        {
            $match: {
                $and: [
                    {'interviews.notifiedUserIds': userId},
                    {'interviews.seq': Number(req.params.seq)},
                ]
            }
        }
    ])
        .then(projectInterviews => {
            if (!projectInterviews || projectInterviews.length === 0) {
                throw Boom.notAcceptable('Does not exist the Interview');
            }

            const interview = projectInterviews[0].interviews;
            const timeSlot = interview.timeSlot;

            if (isAvailableToParticipate(interview)) {
                interview.timeSlots = Object.keys(timeSlot).filter(key => (!timeSlot[key] || timeSlot[key] === userId));
            } else {
                interview.timeSlots = [];
            }

            interview.selectedTimeSlot = Object.keys(timeSlot).filter(key => (timeSlot[key] === userId))[0] || '';

            res.json(projectInterviews[0]);
        })
        .catch(err => next(err));
};

const getInterviewList = (req, res, next) => {
    const currentTime = new Date();
    const userId = req.userId;

    Projects.aggregate([
        {$match: {'status': 'registered'}},
        {$unwind: '$interviews'},
        {
            $match: {
                $and: [
                    {'interviews.notifiedUserIds': userId},
                    {'interviews.openDate': {$lte: currentTime}},
                    {'interviews.closeDate': {$gte: currentTime}}
                ]
            }
        },
        {$sort: {'interviews.interviewDate': -1, 'projectId': 1, 'interviews.seq': 1}}
    ])
        .then(projectInterviews => res.json(filterRegisterdInterviews(userId, projectInterviews)))
        .catch(err => next(err));
};

const filterRegisterdInterviews = (userId, projectInterviews) => {
    return projectInterviews.filter(projectInterview => {
        return !isAlreadyRegistered(userId, projectInterview.interviews.timeSlot)
            && isAvailableToParticipate(projectInterview.interviews);
    });
};

const isAlreadyRegistered = (userId, timeSlot) => {
    return (Object.keys(timeSlot).filter(key => timeSlot[key] === userId).length > 0);
};

const isAvailableToParticipate = (interview) => {
    return (Object.keys(interview.timeSlot).filter(key => interview.timeSlot[key] !== '').length < interview.totalCount);
};

const getRegisteredInterviewList = (req, res, next) => {
    const currentTime = new Date();
    const userId = req.userId;

    //TODO: 성능고려한 튜닝 필요
    Projects.aggregate([
        {$match: {'status': 'registered'}},
        {$unwind: '$interviews'},
        {
            $match: {
                $and: [
                    {'interviews.interviewDate': {$gte: currentTime}},
                    {
                        $or: [
                            {'interviews.timeSlot.time6': userId},
                            {'interviews.timeSlot.time7': userId},
                            {'interviews.timeSlot.time8': userId},
                            {'interviews.timeSlot.time9': userId},
                            {'interviews.timeSlot.time10': userId},
                            {'interviews.timeSlot.time11': userId},
                            {'interviews.timeSlot.time12': userId},
                            {'interviews.timeSlot.time13': userId},
                            {'interviews.timeSlot.time14': userId},
                            {'interviews.timeSlot.time15': userId},
                            {'interviews.timeSlot.time16': userId},
                            {'interviews.timeSlot.time17': userId},
                            {'interviews.timeSlot.time18': userId},
                            {'interviews.timeSlot.time19': userId},
                            {'interviews.timeSlot.time20': userId},
                            {'interviews.timeSlot.time21': userId},
                        ]
                    }

                ]
            }
        },
        {$sort: {'interviews.interviewDate': -1}}
    ])
        .then(projects => {
            projects.forEach(project => {
                const timeSlot = project.interviews.timeSlot;

                project.interviews.timeSlots = [];
                project.interviews.selectedTimeSlot = Object.keys(timeSlot).filter(timeSlotKey => (timeSlot[timeSlotKey] === req.userId))[0];
            });

            res.json(projects);
        })
        .catch(err => next(err));
};

const postParticipate = (req, res, next) => {
    const projectId = parseInt(req.params.id);
    const interviewSeq = parseInt(req.params.seq);
    const slotId = req.params.slotId;
    const userId = req.userId;
    const currentTime = new Date();

    Projects.aggregate([
        {$match: {projectId: projectId}},
        {$unwind: '$interviews'},
        {$match: {'interviews.seq': interviewSeq}},
        {
            $project: {
                'projectId': true,
                'interviewSeq': '$interviews.seq',
                'openDate': '$interviews.openDate',
                'closeDate': '$interviews.closeDate',
                'status': '$status',
                'timeSlot': '$interviews.timeSlot',
                'totalCount': '$interviews.totalCount',
            }
        }
    ])
        .then(interviews => {
            const interview = interviews[0];

            //TODO: 다른 프로젝트,인터뷰의 동일 시간대에 참여 중인 경우 에러 처리
            if (interview.status !== 'registered') {
                throw Boom.notAcceptable();
            } else if (currentTime <= interview.openDate || currentTime >= interview.closeDate) {
                throw Boom.preconditionFailed();
            } else if (!isAvailableToParticipate(interview)) {
                throw Boom.preconditionFailed();
            } else if (!Object.keys(interview.timeSlot).includes(slotId)) {
                throw Boom.rangeNotSatisfiable();
            } else if (interview.timeSlot[slotId] !== "") {
                throw Boom.conflict();
            } else if (Object.keys(interview.timeSlot).filter(id => interview.timeSlot[id] === userId).length > 0) {
                throw Boom.methodNotAllowed();
            } else {
                setTimeSlotWithUserId(projectId, interviewSeq, slotId, userId)
                    .then(() => {
                        createParticipationHistory(userId, 'participate', projectId, interviewSeq, slotId)
                            .then(() => res.sendStatus(200))
                            .catch(() => res.sendStatus(200));
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        })
        .catch(err => next(err));
};

const setTimeSlotWithUserId = (projectId, interviewSeq, slotId, userId) => {
    console.log('Participate Interview At ' + Date.now() + ' : Project-' + projectId + ', Interview-' + interviewSeq + ', slot-' + slotId + ', user-' + userId);
    const updateTargetSlot = {};
    updateTargetSlot['interviews.$.timeSlot.' + slotId] = userId;

    return Projects.findOneAndUpdate({projectId: projectId, 'interviews.seq': interviewSeq},
        {$set: updateTargetSlot}, {upsert: true}).exec();
};

const cancelParticipation = (req, res, next) => {
    const projectId = parseInt(req.params.id);
    const interviewSeq = parseInt(req.params.seq);
    const slotId = req.params.slotId;
    const userId = req.userId;
    const currentTime = new Date();

    Projects.aggregate([
        {$match: {projectId: projectId}},
        {$unwind: '$interviews'},
        {$match: {'interviews.seq': interviewSeq}},
        {
            $project: {
                'projectId': true,
                'interviewSeq': '$interviews.seq',
                'openDate': '$interviews.openDate',
                'closeDate': '$interviews.closeDate',
                'interviewDate': '$interviews.interviewDate',
                'status': '$status',
                'timeSlot': '$interviews.timeSlot'
            }
        }
    ])
        .then(interviews => {
            const interview = interviews[0];
            const hour = parseInt(slotId.substr(4));
            const deadline = interview.interviewDate;
            deadline.setHours(hour, 0, 0, 0);

            if (currentTime >= deadline) {
                throw Boom.preconditionFailed();
            } else if (!Object.keys(interview.timeSlot).includes(slotId)) {
                throw Boom.rangeNotSatisfiable();
            } else if (Object.keys(interview.timeSlot).filter(id => (id === slotId && interview.timeSlot[id] !== userId)).length > 0) {
                throw Boom.notAcceptable();
            } else {
                setTimeSlotWithUserId(projectId, interviewSeq, slotId, '')
                    .then(() => {
                        createParticipationHistory(userId, 'cancel', projectId, interviewSeq, slotId)
                            .then(() => res.sendStatus(200))
                            .catch(() => res.sendStatus(200));
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        })
        .catch(err => next(err));
};

const createParticipationHistory = (userId, type, projectId, interviewSeq, slotId) => {
    return ParticipationHistories.create({
        userId: userId,
        type: type,
        projectId: projectId,
        interviewSeq: interviewSeq,
        slotId: slotId
    });
};

module.exports = {
    getProject,
    getProjectList,
    postParticipate,
    getInterview,
    getInterviewList,
    cancelParticipation,
    getRegisteredInterviewList
};