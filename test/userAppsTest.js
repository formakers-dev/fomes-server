let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let testConfig = require('./testConfig');
let should = chai.should();
let UserApps = require('../models/userApps');

chai.use(chaiHttp);

describe('UserApps', () => {
    describe('POST userApps', () => {
        const doc = {
            "apps": [
                {
                    "packageName": "com.whatever.package1",
                    "appName": "app1"
                }, {
                    "packageName": "com.whatever.package2",
                    "appName": "app2"
                }]
        };

        it('앱 설치 목록을 저장한다', done => {
            chai.request(server)
                .post('/apps/testId')
                .set('x-access-token', testConfig.validToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                })
        });

        it('잘못된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/apps/testId")
                .set('x-access-token', testConfig.invalidToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/apps/testId")
                .set('x-access-token', testConfig.expiredToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
    });

    afterEach((done) => {
        UserApps.remove({userId:'testId'}, () => {
            done();
        });
    });
});