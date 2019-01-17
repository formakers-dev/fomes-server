const axios = require('axios');
const config = require('../config');
const BetaTestsService = require('../services/betaTests');
const UserService = require('../services/users');

const getBetaTestList = (req, res, next) => {
    BetaTestsService.findValidBetaTests(req.userId)
        .then(betaTests => res.json(betaTests))
        .catch(err => next(err))
};

const postComplete = (req, res, next) => {
    BetaTestsService.updateCompleted(req.params.id, req.userId)
        .then(betaTest => {
            if (betaTest) {
                return UserService.getUser(req.userId).then(user => {
                    const body = {
                        'data' : {
                            'channel' : 'channel_betatest',
                            'title' : config.notification.completeTitle,
                            'subTitle' : config.notification.completeSubtitle.replace(":TITLE", betaTest.title)
                        },
                        'to' : user.registrationToken,
                    };

                    return axios.post('https://fcm.googleapis.com/fcm/send', body, {
                        headers: {
                            'Authorization': 'key=' + config.notification.apiKey,
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

module.exports = {
    getBetaTestList,
    postComplete
};