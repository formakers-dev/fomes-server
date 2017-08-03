const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const UserApps = require('../models/userApps');

chai.use(chaiHttp);

describe('UserApps', () => {
    describe('POST userApps', () => {
        const doc = [{
                    "packageName": "com.whatever.package1",
                    "appName": "app1"
                },
                {
                    "packageName": "com.whatever.package2",
                    "appName": "app2"
                }];

        it('앱 설치 목록을 저장한다', done => {
            chai.request(server)
                .post('/apps')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                });
        });

        it('잘못된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/apps")
                .set('x-access-token', config.appbeeToken.invalid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/apps")
                .set('x-access-token', config.appbeeToken.expired)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    afterEach((done) => {
        UserApps.remove({userId : config.testUserId}, () => {
            done();
        });
    });
});