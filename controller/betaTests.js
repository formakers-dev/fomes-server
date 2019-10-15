const axios = require('axios');
const config = require('../config');
const BetaTestsService = require('../services/betaTests');
const UsersService = require('../services/users');
const ConfigurationsService = require('../services/configurations');

const getBetaTestList = (req, res, next) => {
    BetaTestsService.findValidBetaTests(req.userId)
        .then(betaTests => res.json(betaTests))
        .catch(err => next(err))
};

const getFinishedBetaTestList = (req, res, next) => {
    BetaTestsService.findFinishedBetaTests(req.userId)
        .then(betaTests => res.json(betaTests))
        .catch(err => next(err))
};

const getDetailBetaTest = (req, res, next) => {
    BetaTestsService.findBetaTest(req.params.id, req.userId)
        .then(betaTest => res.json(betaTest))
        .catch(err => next(err))
};

const getProgress = (req, res, next) => {
  BetaTestsService.findBetaTestProgress(req.params.id, req.userId)
      .then(betaTests => res.json(betaTests[0]))
      .catch(err => next(err))
};

const getMissionProgress = (req, res, next) => {
    BetaTestsService.findMissionItemsProgress(req.params.id, req.userId)
        .then(missionItems => res.json(missionItems))
        .catch(err => next(err));
};

const getAllBetaTestsCount = (req, res, next) => {
    BetaTestsService.getAllBetaTestsCount()
        .then(allBetaTestsCount => {
            res.send(allBetaTestsCount.toString());
        }).catch(err => next(err));
};

const getTotalRewards = (req, res, next) => {
    BetaTestsService.getAllRewards()
        .then(rewards => {
            const allRewardsSummary = rewards.map(reward => {
                reward.content = reward.content.match(new RegExp(/([0-9]+)원/))[1];
                return reward;
            }).reduce((sum, reward) => {
                sum += reward.content * reward.userCount;
                return sum
            }, 0);

            // console.log(rewards);
            // console.log(allRewardsSummary);
            res.send(allRewardsSummary.toString());
        }).catch(err => next(err));
};


const postComplete = (req, res, next) => {
    console.log("[", req.userId, "] postComplete", req.params.id);

    BetaTestsService.updateCompleted(req.params.id, req.userId)
        .then(betaTest => {
            if (betaTest) {
                const notificationData = req.body.notificationData;
                console.log("[", req.userId, "] updateCompleted - notificationData", notificationData);

                if (!notificationData) {
                    return;
                }

                return UsersService.getUser(req.userId)
                    .then(user => {
                        const body = {
                            'data' : req.body.notificationData,
                            'to' : user.registrationToken,
                        };

                        return axios.post('https://fcm.googleapis.com/fcm/send', body, {
                            headers: {
                                'Authorization': 'key=' + config.notificationApiKey,
                                'Content-Type': 'application/json'
                            }
                        })
                    });

            } else {
                return Promise.resolve();
            }
        })
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

const postTargetUser = (req, res, next) => {
    const betaTestIds = req.body.betaTestIds;
    BetaTestsService.addTargetUserId(betaTestIds, req.userId)
        .then(result => {
            if (result.matchedCount !== betaTestIds.length) {
                res.sendStatus(207);
            }
        })
        .then(() => {
            const notificationData = req.body.notificationData;

            if (!notificationData) {
                return;
            }

            return UsersService.getUser(req.userId)
                .then(user => {
                    const body = {
                        'data' : req.body.notificationData,
                        'to' : user.registrationToken,
                    };

                    return axios.post('https://fcm.googleapis.com/fcm/send', body, {
                        headers: {
                            'Authorization': 'key=' + config.notificationApiKey,
                            'Content-Type': 'application/json'
                        }
                    })
                });
        })
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
};

module.exports = {
    getBetaTestList,
    getFinishedBetaTestList,
    getDetailBetaTest,
    getProgress,
    getMissionProgress,
    getAllBetaTestsCount,
    getTotalRewards,
    postComplete,
    postTargetUser
};