const Projects = require('../models/projects');

const getProject = (req, res) => {
    const projectId = parseInt(req.params.id);

    Projects.findOne({projectId: projectId, status: 'registered'})
        .select('-interviews')
        .exec()
        .then(project => res.json(project))
        .catch(err => res.status(500).json({error: err}));
};

const getProjectList = (req, res) => {
    Projects.find({status: 'registered'})
        .select('-interviews')
        .sort({projectId: 1})
        .exec()
        .then(projects => res.json(projects))
        .catch(err => res.status(500).json({error: err}));
};

//TODO : InterviewList 조회시 CurrentTime과 Locale상관관계 확인 필요
const getInterview = (req, res) => {
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
        .exec()
        .then(projectInterviews => {
            if (!projectInterviews || projectInterviews.length === 0) {
                res.sendStatus(406);
                return;
            }

            const interview = projectInterviews[0].interviews;
            const timeSlot = interview.timeSlot;

            interview.timeSlots = Object.keys(timeSlot).filter(key => (!timeSlot[key] || timeSlot[key] === userId));
            interview.selectedTimeSlot = Object.keys(timeSlot).filter(key => (timeSlot[key] === userId))[0] || '';
            interview.availableCount = interview.totalCount - Object.keys(timeSlot).filter(key => (timeSlot[key] !== '')).length;

            res.json(projectInterviews[0]);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        });
};

const getInterviewList = (req, res) => {
    //TODO : 추후 글로벌 확산 시 로케일 적용 필요, 현재는 서버기준로케일(한국) 따라감
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
        .exec()
        .then(projectInterviews => res.json(filterRegisterdInterviews(userId, projectInterviews)))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
};

const filterRegisterdInterviews = (userId, projectInterviews) => {
    return projectInterviews.filter(projectInterview => {
        return !isAlreadyRegistered(userId, projectInterview.interviews.timeSlot)
            && isAvailableToParticipate(projectInterview.interviews);
    });
};

const isAlreadyRegistered = (userId, timeSlot) => {
    return Object.keys(timeSlot).filter(key => timeSlot[key] === userId).length > 0;
};

const isAvailableToParticipate = (interview) => {
    return Object.keys(interview.timeSlot).filter(key => interview.timeSlot[key] !== '').length < interview.totalCount;
};

const getRegisteredInterviewList = (req, res) => {
    //TODO : 추후 글로벌 확산 시 로케일 적용 필요, 현재는 서버기준로케일(한국) 따라감
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
        .exec()
        .then(projects => {
            projects.forEach(project => {
                const timeSlot = project.interviews.timeSlot;

                project.interviews.timeSlots = [];
                project.interviews.selectedTimeSlot = Object.keys(timeSlot).filter(timeSlotKey => (timeSlot[timeSlotKey] === req.userId))[0];
            });

            res.json(projects);
        })
        .catch(err => res.status(500).json({error: err}));
};

const postParticipate = (req, res) => {
    //TODO : 추후 글로벌 확산 시 로케일 적용 필요, 현재는 서버기준로케일(한국) 따라감
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
                'timeSlot': '$interviews.timeSlot'
            }
        }
    ])
        .exec()
        .then(interviews => {
            const interview = interviews[0];
            //TODO: 다른 프로젝트,인터뷰의 동일 시간대에 참여 중인 경우 에러 처리
            if (interview.status !== 'registered') {
                res.sendStatus(406);
            } else if (currentTime <= interview.openDate || currentTime >= interview.closeDate) {
                res.sendStatus(412);
            } else if (!Object.keys(interview.timeSlot).includes(slotId)) {
                res.sendStatus(416);
            } else if (interview.timeSlot[slotId] !== "") {
                res.sendStatus(409);
            } else if (Object.keys(interview.timeSlot).filter(id => interview.timeSlot[id] === userId).length > 0) {
                res.sendStatus(405);
            } else {
                setTimeSlotWithUserId(projectId, interviewSeq, slotId, userId)
                    .then(() => res.send(true))
                    .catch((err) => {
                        res.send(err);
                    });
            }
        })
        .catch(err => res.status(500).json({error: err}));
};

const setTimeSlotWithUserId = (projectId, interviewSeq, slotId, userId) => {
    console.log('Participate Interview At ' + Date.now() + ' : Project-' + projectId + ', Interview-' + interviewSeq + ', slot-' + slotId + ', user-' + userId);
    const updateTargetSlot = {};
    updateTargetSlot['interviews.$.timeSlot.' + slotId] = userId;

    return Projects.findOneAndUpdate({projectId: projectId, 'interviews.seq': interviewSeq},
        {$set: updateTargetSlot}, {upsert: true}).exec();
};

const cancelParticipation = (req, res) => {
    //TODO : 추후 글로벌 확산 시 로케일 적용 필요, 현재는 서버기준로케일(한국) 따라감
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
        .exec()
        .then(interviews => {
            const interview = interviews[0];
            const hour = parseInt(slotId.substr(4));
            const deadline = interview.interviewDate;
            deadline.setHours(hour, 0, 0, 0);

            if (!Object.keys(interview.timeSlot).includes(slotId)) {
                res.sendStatus(416);
            } else if (currentTime >= deadline) {
                res.sendStatus(412);
            } else if (Object.keys(interview.timeSlot).filter(id => (id === slotId && interview.timeSlot[id] !== userId)).length > 0) {
                res.sendStatus(406);
            } else {
                setTimeSlotWithUserId(projectId, interviewSeq, slotId, '')
                    .then(() => res.send(true))
                    .catch((err) => {
                        res.send(err);
                    });
            }
        })
        .catch(err => res.status(500).json({error: err}));

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