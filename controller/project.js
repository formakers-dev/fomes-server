const Projects = require('../models/projects');

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

    Projects.findOneAndUpdate({projectId : projectId}, { $push: { 'interview.participants': req.userId } })
        .exec()
        .then(() => {
            res.send(true);
        })
        .catch((err) => {
            res.send(err);
        });
};

module.exports = { getProject, getProjectList, postParticipate };