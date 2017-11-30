const Projects = require('../models/projects');

const getProject = (req, res) => {
    const projectId = parseInt(req.params.id);

    Projects.findOne({projectId: projectId, status: {$ne: "temporary"}})
        .select('-interviews')
        .exec()
        .then(project => res.json(project))
        .catch(err => res.status(500).json({error: err}));
};

const getProjectList = (req, res) => {
    Projects.find({status: {$ne: "temporary"}})
        .select('-interviews')
        .sort({projectId: 1})
        .exec()
        .then(projects => res.json(projects))
        .catch(err => res.status(500).json({error: err}));
};

//TODO : InterviewList 조회시 CurrentTime과 Locale상관관계 확인 필요
const getInterview = (req, res) => {
    const currentTime = new Date();

    Projects.aggregate([
        {$match: {projectId: Number(req.params.id)}},
        {$unwind: '$interviews'},
        {
            $match: {
                $and: [
                    {'interviews.notifiedUserIds': req.userId},
                    {'interviews.seq': Number(req.params.seq)},
                    {'interviews.status': {$ne: "temporary"}},
                    {'interviews.openDate': {$lte: currentTime}},
                    {'interviews.closeDate': {$gte: currentTime}}
                ]
            }
        }
    ])
        .exec()
        .then(projectInterviews => {
            const interview = projectInterviews[0].interviews;

            interview.timeSlots = Object.keys(interview.timeSlot).filter(timeSlotKey => (!interview.timeSlot[timeSlotKey] || interview.timeSlot[timeSlotKey] === req.userId));
            interview.selectedTimeSlot = Object.keys(interview.timeSlot).filter(timeSlotKey => (interview.timeSlot[timeSlotKey] === req.userId))[0] || '';

            res.json(projectInterviews[0]);
        })
        .catch(err => res.status(500).json({error: err}));
};


//TODO : InterviewList 조회시 CurrentTime과 Locale상관관계 확인 필요
const getInterviewList = (req, res) => {
    const currentTime = new Date();
    const userId = req.userId;

    Projects.aggregate([
        {$match: {'status': {$ne: "temporary"}}},
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
        .then(projectInterviews => res.json(filterRegistredInterviews(userId, projectInterviews)))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
};


const filterRegistredInterviews = (userId, projectInterviews) => {
    return projectInterviews.filter(projectInterview => !isAlreadyRegistered(userId, projectInterview.interviews.timeSlot));
};

const isAlreadyRegistered = (userId, timeSlot) => {
    return Object.keys(timeSlot).filter(timeSlotKey => timeSlot[timeSlotKey] === userId).length > 0;
};

const getRegisteredInterviewList = (req, res) => {
    const currentTime = new Date();
    const userId = req.userId;

    //TODO: 성능고려한 튜닝 필요
    Projects.aggregate([
        {$unwind: '$interviews'},
        {
            $match: {
                $and: [
                    {'interviews.openDate': {$lte: currentTime}},
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
    const projectId = parseInt(req.params.id);
    const interviewSeq = parseInt(req.params.seq);
    const slotId = req.params.slotId;
    const userId = req.userId;
    const currentTime = Date.now();

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
    const updateTargetSlot = {};
    updateTargetSlot['interviews.$.timeSlot.' + slotId] = userId;

    return Projects.findOneAndUpdate({projectId: projectId, 'interviews.seq': interviewSeq},
        {$set: updateTargetSlot}, {upsert: true}).exec();
};

const cancelParticipation = (req, res) => {
    const projectId = parseInt(req.params.id);
    const interviewSeq = parseInt(req.params.seq);
    const slotId = req.params.slotId;
    const userId = req.userId;
    const currentTime = Date.now();

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
            deadline.setUTCHours(hour);

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