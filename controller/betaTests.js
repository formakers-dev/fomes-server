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
        .then(doc => {
            if (doc) {
                return UserService.getUser(req.userId).then(user => {
                    const body = {
                        'data' : {
                            'channel' : 'channel_betatest',
                            'title' : '참여하신 테스트가 완료처리 되었어요!👏',
                            'subTitle' : '멋져요! 다음 테스트가 도착하면 다시 알려드릴게요.'
                        },
                        'to' : user.registrationToken,
                    };

                    return axios.post('https://fcm.googleapis.com/fcm/send', body, {
                        headers: {
                            'Authorization': 'key=' + config.notiApiKey,
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