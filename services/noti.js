const axios = require('axios');
const config = require('../config');

const send = (notificationData, targetNotiToken) => {
    console.log("noti send) notificationData=", notificationData, " targetNotiToken=", targetNotiToken);

    if (!notificationData) {
        return Promise.reject("Notification Data is not exist!");
    }

    const body = {
        'data': notificationData,
        'to': targetNotiToken,
    };

    return axios.post('https://fcm.googleapis.com/fcm/send', body, {
        headers: {
            'Authorization': 'key=' + config.notificationApiKey,
            'Content-Type': 'application/json'
        }
    })

};

module.exports = { send };