const mongoose = require('mongoose');
const config = require('./config');

const TAG = '[DB]';

const init = () => {
    const gracefulExit = cause => {
        mongoose.disconnect()
            .then( () => {
                console.log(TAG, `All connections are disconnected due to exit process by ${cause}`);
                process.exit();
            })
            .catch(err => {
                console.error(TAG, `Error occured on disconnecting due to exit process by ${cause}:\n`, err);
                process.exit();
            });
    };

    ['exit', 'SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
        process.on(signal, gracefulExit);
    });

    process.on('uncaughtException', err => {
        console.error('Uncaught Exception:', err);
        gracefulExit('uncaught exception');
    });

    mongoose.connection.on('connected', () => {
        console.log(TAG, 'Default connection is connected');
    });
    mongoose.connection.on('error', err => {
        console.error(TAG, 'Default connection has occurred error:', err);
    });
    mongoose.connection.on('disconnected', () => {
        console.log(TAG, 'Default connection is disconnected');

        mongoose.connect(config.dbUrl, {useNewUrlParser: true})
            .catch(err => {
                console.error(TAG, 'Error is occurred on connecting:', err);
            });
    });

    mongoose.connect(config.dbUrl, {useNewUrlParser: true})
        .catch(err => {
            console.error(TAG, 'Error is occurred on connecting:', err);
        });
};

module.exports = {init};