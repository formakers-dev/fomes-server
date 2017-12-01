const chai = require('chai');
const server = require('../server');
const request = require('supertest').agent(server);
const config = require('../config');
const Configurations = require('../models/configurations');
const should = chai.should();

describe('Configurations', () => {

    const configurationData = {
        minAppVersionCode: 2,
        excludeAnalysisPackageNames: ['com.kakao.talk', 'com.line.talk']
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

    describe('GET /config/excludePackageNames', () => {
        it('앱 버전을 조회한다', done => {
            request.get('/config/excludePackageNames')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);
                    res.body[0].should.be.eql('com.kakao.talk');
                    res.body[1].should.be.eql('com.line.talk');
                    done();
                }).catch(err => done(err));
        });
    });

    afterEach((done) => {
        Configurations.remove({}, done);
    });
});