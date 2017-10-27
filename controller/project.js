const Projects = require('../models/projects');

const getProject = (req, res) => {
    const projectId = req.query.projectId;
    console.log('getProject');
    console.log('projectId : ' + projectId);

    Projects.find({projectId: projectId}, (err, result) => {
        if(err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    });
};

const getAllProjects = (req, res) => {
    Projects.find((err, result) => {
        if(err) {
            return res.status(500).json({error: err});
        }
        res.json(result);
    });
};

module.exports = { getProject, getAllProjects};