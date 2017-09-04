const sinon = require('sinon');
const config = require('../config')[process.env.NODE_ENV];

const setupSinon = () => {
    try {
        sinon.stub(Auth, 'googleTokenVerifier').callsFake((req, res, next) => {
            req.user = {
                'userId' : config.testUserId,
                'email' : 'testEmail',
                'name' : 'testName',
                'provider' : 'GG'
            };
            return next();
        });
    } catch(e) {
    }
};

module.exports = setupSinon;