const sinon = require('sinon');
const Auth = require('../middleware/auth');
const config = require('../config');
const Users = require('../models/users').Users;

const setupSinon = () => {
    try {
        sinon.stub(Auth, 'verifyGoogleToken').callsFake((req, res, next) => {
            req.body.provider = 'google';
            req.body.providerId = '109974316241227718963';
            req.body.userId = config.testUser.userId;
            req.body.email = 'test@email.com';
            req.body.name = 'testName';
            req.userId = config.testUser.userId;
            return next();
        });
    } catch (e) {
    }
};

const commonBefore = () => {
    return Users.create(config.testUser);
};

const commonAfter = () => {
    return Users.remove({});
};

module.exports = {setupSinon, commonBefore, commonAfter};