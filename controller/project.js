const Projects = require('../models/projects');

const getProject = (req, res) => {
    const projectId = req.query.projectId;

    if (projectId) {
        Projects.find({projectId: projectId}, (err, result) => {
            if(err) {
                return res.status(500).json({error: err});
            }
            res.json(result);
        });
    } else {
        Projects.find((err, result) => {
            if(err) {
                return res.status(500).json({error: err});
            }
            res.json(result);
        });
    }
};

module.exports = { getProject };