const BetaTestsService = require('../services/betaTests');

const getBetaTestList = (req, res, next) => {
    BetaTestsService.findValidBetaTests(req.userId)
        .then(betaTests => res.json(betaTests))
        .catch(err => next(err))
};

const postComplete = (req, res, next) => {
    BetaTestsService.updateCompleted(req.params.id, req.userId)
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

module.exports = {
    getBetaTestList,
    postComplete
};