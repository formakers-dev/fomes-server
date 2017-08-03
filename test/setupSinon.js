const sinon = require('sinon');
const Auth = require('../middleware/auth');

const setupSinon = () => {
    try {
        sinon.stub(Auth, 'googleTokenVerifier').callsFake((req, res, next) => {
            req.user = {
                'userId' : 'testId',
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