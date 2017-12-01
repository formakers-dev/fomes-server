const chai = require('chai');
const server = require('../server');
const request = require('supertest').agent(server);
const Configurations = require('../models/configurations');
const should = chai.should();

describe('Configurations', () => {

    const configurationData = {
        minAppVersionCode: 2,
    };

    beforeEach((done) => {
        Configurations.create(configurationData, done);
    });

    describe('GET /config/version', () => {
        it('앱 버전을 조회한다', done => {
            request.get('/config/version')
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(2);
                    done();
                }).catch(err => done(err));
        });
    });

    afterEach((done) => {
        Configurations.remove({}, done);
    });
});