const Projects = require('../models/projects');

const getProject = (req, res) => {
    const projectId = parseInt(req.params.id);

    Projects.aggregate([
        {"$match": {projectId: projectId, status: {"$ne": "temporary"}}},
        {"$project": {"interviews": false}}
    ], (err, result) => {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json(result[0]);
    });
};

const getProjectList = (req, res) => {
    Projects.aggregate([
        {"$match": {status: {"$ne": "temporary"}}},
        {"$project": {"interviews": false}}
    ], (err, result) => {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    });
};

const getInterview = (req, res) => {
    const currentTime = new Date();
    Projects.aggregate([
        {'$match': {projectId: Number(req.params.id)}},
        {'$unwind': '$interviews'},
        {
            '$match': {
                $and: [
                    {'interviews.notifiedUserIds': req.userId},
                    {'interviews.seq': Number(req.params.seq)},
                    {'interviews.status': {"$ne": "temporary"}},
                    {'interviews.openDate': {$lte: currentTime}},
                    {'interviews.closeDate': {$gte: currentTime}}
                ]
            }
        }
    ], (err, interviews) => {
        if (err) {
            res.json(err);
        }
        res.json(interviews[0]);
    });
};

const getInterviewList = (req, res) => {
    const currentTime = new Date();
    console.log(currentTime);
    console.log(req.userId);
    Projects.aggregate([
        {'$match': { 'status': {"$ne": "temporary"}}},
        {'$unwind': '$interviews'},
        {
            '$match': {
                $and: [
                    {'interviews.notifiedUserIds': req.userId},
                    {'interviews.openDate': {$lte: currentTime}},
                    {'interviews.closeDate': {$gte: currentTime}}
                ]
            }
        }
    ], (err, interviews) => {
        if (err) {
            res.json(err);
        }
        res.json(interviews);
    });
};

const postParticipate = (req, res) => {
    const projectId = parseInt(req.params.id);
    const interviewSeq = parseInt(req.params.seq);
    const slotId = req.params.slotId;
    const userId = req.userId;
    const currentTime = new Date().getTime();

    Projects.aggregate([
        {'$match': {projectId: projectId}},
        {'$unwind': '$interviews'},
        {'$match': {'interviews.seq': interviewSeq}},
        {
            '$project': {
                'projectId': true,
                'interviewSeq': '$interviews.seq',
                'openDate': '$interviews.openDate',
                'closeDate': '$interviews.closeDate',
                'status': '$status',
                'timeSlot': '$interviews.timeSlot'
            }
        }
    ], (err, interviews) => {
        const interview = interviews[0];
        //TODO: 다른 프로젝트,인터뷰의 동일 시간대에 참여 중인 경우 에러 처리
        if (interview.status !== 'registered') {
            res.sendStatus(406);
        } else if (currentTime <= interview.openDate || currentTime >= interview.closeDate) {
            res.sendStatus(406)
        } else if (interview.timeSlot[slotId] !== "") {
            res.sendStatus(409);
        } else if (Object.keys(interview.timeSlot).filter(id => interview.timeSlot[id] === userId).length > 0) {
            res.sendStatus(405)
        } else if (!Object.keys(interview.timeSlot).includes(slotId)) {
            res.sendStatus(409);
        } else {
            const updateTargetSlot = {};
            updateTargetSlot['interviews.$.timeSlot.' + slotId] = userId;

            Projects.findOneAndUpdate({projectId: projectId, 'interviews.seq': interviewSeq},
                {$set: updateTargetSlot}, {upsert: true})
                .exec()
                .then(project => {
                    console.log(project);
                    res.send(true);
                })
                .catch((err) => {
                    console.log(err);
                    res.send(err);
                });
        }
    });

};

module.exports = {getProject, getProjectList, postParticipate, getInterview, getInterviewList};