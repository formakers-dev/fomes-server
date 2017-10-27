const mongoose = require('mongoose');
const config = require('./config');

const connect = () => {
    mongoose.connect(config.dbUrl, function(err) {
        if (err) {
            console.error('mongodb connection error', err);
        } else {
            console.log('mongodb connected');
        }
    });
};

const setRecoverConfig = () => {
    mongoose.connection.on('disconnected', connect);
};

const init = () => {
    connect();
    setRecoverConfig();
};

module.exports = {init};