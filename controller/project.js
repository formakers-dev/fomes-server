const Projects = require('../models/projects');
const moment = require('moment');

const getProject = (req, res) => {
    const projectId = req.params.id;

    Projects.find({$and: [{projectId: projectId},{status: { $ne: "temporary"}}]}, (err, result) => {
        if(err) {
            return res.status(500).json({error: err});
        }
        res.json(result[0]);
    });
};

const getProjectList = (req, res) => {
    Projects.find({status: { $ne: "temporary"}}, (err, result) => {
        if(err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    });
};

const postParticipate = (req, res) => {
    const projectId = req.params.id;
    const userId = req.userId;
    const currentTime = new Date().getTime();

    Projects.findOne({projectId: projectId}, (err, project) => {
        const openTime = moment(project.interview.openDate).toDate().getTime();
        const closeTime = moment(project.interview.closeDate).toDate().getTime();

        if (project.status !== 'registered') {
            res.sendStatus(406);
        } else if (currentTime <= openTime || currentTime >= closeTime) {
            res.sendStatus(406)
        } else if (project.interview.participants.includes(userId)) {
            res.sendStatus(409);
        } else if (project.interview.participants.length >= project.interview.totalCount) {
            res.sendStatus(416);
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

module.exports = { getProject, getProjectList, postParticipate };