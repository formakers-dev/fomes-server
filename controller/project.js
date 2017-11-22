const Projects = require('../models/projects');

const getProject = (req, res) => {
    const projectId = parseInt(req.params.id);

    Projects.aggregate([
        {"$match" : { $and : [{projectId: projectId}, { status: { "$ne" : "temporary"}}]}},
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
        {"$match" : { status: { "$ne" : "temporary"}}},
        {"$project": {"interviews": false}}
    ], (err, result) => {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    });
};

const getInterview = (req, res) => {
    Projects.aggregate([
        {'$unwind': '$interviews'},
        {'$match':{ $and: [{'interviews.notifiedUserIds': req.userId}, {'interviews.seq': Number(req.params.seq)}]}}
    ], (err, interviews) => {
        if (err) {
            res.json(err);
        }
        res.json(interviews[0]);
    });
};

const getInterviewList = (req, res) => {
    Projects.aggregate([
        {'$unwind': '$interviews'},
        {'$match':{'interviews.notifiedUserIds': req.userId}}
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
                'status': '$interviews.status',
                'participants': '$interviews.participants'
            }
        }
    ], (err, projects) => {
        const interview = projects[0];

        if (interview.status !== 'registered') {
            res.sendStatus(406);
        } else if (currentTime <= interview.openDate || currentTime >= interview.closeDate) {
            res.sendStatus(406)
        } else if (interview.participants.filter(user => user.userId === userId).length > 0) {
            res.sendStatus(409);
        } else {
            Projects.findOneAndUpdate({projectId: projectId}, {$push: {'interview.participants': userId}})
                .exec()
                .then(() => {
                    res.send(true);
                })
                .catch((err) => {
                    res.send(err);
                });
        }
    });

};

module.exports = {getProject, getProjectList, postParticipate, getInterview, getInterviewList};