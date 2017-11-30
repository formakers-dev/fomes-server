const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const Configurations = require('../models/configurations');
const should = chai.should();

describe('Configurations', () => {

    const configData = {
        minAppVersionCode: 2,
    };

    beforeEach((done) => {
        Configurations.create(configData, done);
    });

    describe('GET /config/version', () => {
        it('앱 버전을 조회한다', done => {
            request.get('/config/version')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.version.should.be.eql(2);
                    done();
                }).catch(err => done(err));
        });
    });

    afterEach((done) => {
        Configurations.remove({}, done);
    });
});