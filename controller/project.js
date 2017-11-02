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

module.exports = { getProject, getProjectList };