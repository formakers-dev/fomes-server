const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const expect = chai.expect;
const UserApps = require('../models/userApps');
const UncrawledApps = require('../models/uncrawledApps');

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

        it('앱 설치 목록을 저장하고 Apps 테이블에 없는 앱들은 별도로 저장한다', done => {
            chai.request(server)
                .post('/apps')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    UserApps.findOne({userId: config.testUserId}, (err, userApps) => {
                        userApps.apps.length.should.be.eql(2);
                        verifyUserAppsData(userApps.apps[0], "com.whatever.package1", "app1");
                        verifyUserAppsData(userApps.apps[1], "com.whatever.package2", "app2");
                        done();
                    })
                });
        });

        it('Apps 테이블에 없는 앱들은 별도로 저장한다', done => {
            chai.request(server)
                .post('/apps')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    UncrawledApps.find({"packageName" : {$in : ["com.whatever.package1", "com.whatever.package2"]}}, (err, uncrawledApps) => {
                        uncrawledApps.length.should.be.eql(2);
                        done();
                    });
                });
        });

        it('잘못된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/apps")
                .set('x-access-token', config.appbeeToken.invalid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    verifyDoNotInsertData(done);
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/apps")
                .set('x-access-token', config.appbeeToken.expired)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(401);
                    verifyDoNotInsertData(done);
                });
        });

        const verifyUserAppsData = (app, packageName, appName) => {
            app.packageName.should.be.eql(packageName);
            app.appName.should.be.eql(appName);
        };

        const verifyDoNotInsertData = (done) => {
            UserApps.findOne({userId: config.testUserId}, (err, userApps) => {
                expect(userApps).to.be.null;
                done();
            });
        };
    });

    afterEach((done) => {
        UserApps.remove({userId : config.testUserId})
            .then(() => {
                console.log("UncrawledApps.deleteMany");
                UncrawledApps.deleteMany({"packageName" : {$in : ["com.whatever.package1", "com.whatever.package2"]}});
                done();
            })
            .catch((err) => {
                console.log(err.message);
                done();
            });
    });
});