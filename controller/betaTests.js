const axios = require('axios');
const Boom = require('boom');
const config = require('../config');
const BetaTestsService = require('../services/betaTests');
const UsersService = require('../services/users');

const getBetaTestList = (req, res, next) => {
    BetaTestsService.findValidBetaTests(req.userId)
        .then(betaTests => res.json(betaTests))
        .catch(err => next(err))
};

const getFinishedBetaTestList = (req, res, next) => {
    BetaTestsService.findFinishedBetaTests(req.userId, req.query.verbose)
        .then(betaTests => res.json(betaTests))
        .catch(err => next(err))
};

const getDetailBetaTest = (req, res, next) => {
    BetaTestsService.findBetaTest(req.params.id, req.userId)
        .then(betaTest => res.json(betaTest))
        .catch(err => next(err))
};

const getProgress = (req, res, next) => {
  BetaTestsService.findBetaTestProgress(req.params.id, req.userId, req.query.verbose)
      .then(betaTests => res.json(betaTests))
      .catch(err => next(err))
};

const getMissionProgress = (req, res, next) => {
    BetaTestsService.findMissionParticipation(req.params.id, req.params.missionId, req.userId)
        .then(participation => {
            console.log(participation);
            res.json({
                _id: req.params.missionId,
                isCompleted: !!participation,
            })
        }).catch(err => next(err));
};

const getAwardRecord = (req, res, next) => {
    BetaTestsService.findAwardRecords(req.params.id)
        .then(awardRecords => {
            const filteredMyAwardRecords = awardRecords.filter(awardRecord => awardRecord.userId === req.userId);

            if (filteredMyAwardRecords && filteredMyAwardRecords.length > 0) {
                res.json(filteredMyAwardRecords[0])
            } else {
                next(Boom.notFound("User's award record doesn't exists!"));
            }
        })
        .catch(err => next(err))
};

const getEpilogue = (req, res, next) => {
    BetaTestsService.findEpilogue(req.params.id)
        .then(epilogue => {
            if (epilogue) {
                res.json(epilogue)
            } else {
                next(Boom.notFound("Epilogue doesn't exists!"));
            }
        })
        .catch(err => next(err))
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
            const allRewardsSummary = rewards.reduce((sum, reward) => {
                sum += reward.price * reward.userCount;
                return sum
            }, 0);

            res.send(allRewardsSummary.toString());
        }).catch(err => next(err));
};

const getAccumulatedCompletedUsersCount = (req, res, next) => {
    BetaTestsService.getCompletedUsersCountFromAllMissionItem()
        .then(completedUsersCountList => {
            const Accumulated = completedUsersCountList.reduce((sum, item) => {
                sum += item.completedUsersCount;
                return sum;
            }, 0);

            res.send(Accumulated.toString());
        }).catch(err => next(err));
};

const postAttend = (req, res, next) => {
    BetaTestsService.attend(req.params.id, req.userId)
        .then(() => res.sendStatus(200))
        .catch(err => {
            if (err instanceof BetaTestsService.AlreadyExistError) {
                next(Boom.conflict());
            } else {
                next(err);
            }
        });
};

const postMissionComplete = (req, res, next) => {
    console.log("[", req.userId, "] postMissionComplete betaTest:", req.params.id, ", mission: ", req.params.missionId);

    BetaTestsService.completeMission(req.params.id, req.params.missionId, req.userId)
        .then(participation => {
            if (!participation) {
                return Promise.resolve();
            }

            const notificationData = req.body.notificationData;
            console.log("[", req.userId, "] postMissionComplete - notificationData", notificationData);

            if (!notificationData) {
                console.error("[", req.userId, "] notificationData is none!");
                return;
            }

            return UsersService.getUser(req.userId)
                .then(user => {
                    const body = {
                        'data': req.body.notificationData,
                        'to': user.registrationToken,
                    };

                    return axios.post('https://fcm.googleapis.com/fcm/send', body, {
                        headers: {
                            'Authorization': 'key=' + config.notificationApiKey,
                            'Content-Type': 'application/json'
                        }
                    })
                });
        })
        .then(() => BetaTestsService.checkAndCompleteBetaTest(req.params.id, req.userId))
        .then(() => {
            // TODO : 추후 beta-test completed 에 대한 정보를 body에 담아 보내주기
            res.sendStatus(200)
        })
        .catch(err => {
            if (err instanceof BetaTestsService.AlreadyExistError) {
                next(Boom.conflict());
            } else if (err instanceof BetaTestsService.NotAttendedError) {
                next(Boom.preconditionRequired());
            } else {
                next(err);
            }
        });
};

const postComplete = (req, res, next) => {
    console.log("[", req.userId, "] postComplete", req.params.id);

    BetaTestsService.completeBetaTest(req.params.id, req.userId)
        .then(participation => {
            if (!participation) {
                return Promise.resolve();
            }

            const notificationData = req.body.notificationData;
            console.log("[", req.userId, "] postComplete - notificationData", notificationData);

            if (!notificationData) {
                return;
            }

            return UsersService.getUser(req.userId)
                .then(user => {
                    const body = {
                        'data': req.body.notificationData,
                        'to': user.registrationToken,
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
        .catch(err => {
            if (err instanceof BetaTestsService.AlreadyExistError) {
                next(Boom.conflict());
            } else if (err instanceof BetaTestsService.NotAttendedError) {
                next(Boom.preconditionRequired());
            } else {
                next(err);
            }
        });
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
    getAwardRecord,
    getEpilogue,
    getAllBetaTestsCount,
    getTotalRewards,
    getAccumulatedCompletedUsersCount,

    postAttend,
    postMissionComplete,
    postComplete,
    postTargetUser
};
