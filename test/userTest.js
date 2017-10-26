const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const Users = require('../models/user');
const jwt = require('jsonwebtoken');
require('./setupSinon')();
const server = require('../server');
const UserApps = require('../models/userApps');

chai.use(chaiHttp);

describe('Users', () => {

    describe('POST user', () => {
        let testUser = config.testUser;
        testUser.registrationToken = 'new_user_token';

        it('google id토큰 검증 후 API 사용을 위한 appbee 토큰을 발급하여 리턴한다', done => {
            chai.request(server)
                .post('/user')
                .set('x-access-token', config.appbeeToken.valid)
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);

                    Users.findOne({userId: testUser.userId}, (err, user) => {
                        verifyUserToken(user, user.userId, user.registrationToken);
                        done();
                    });
                });
        });

        const verifyUserToken = (user, userId, registrationToken) => {
            user.userId.should.be.eql(userId);
            user.registrationToken.should.be.eql(registrationToken);
        };

        afterEach((done) => {
            Users.remove({ userId : config.testUser.userId }, () => {
                done();
            });
        });
    });

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
                .post('/user/apps')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    UserApps.findOne({userId: config.testUser.userId}, (err, userApps) => {
                        userApps.apps.length.should.be.eql(2);
                        verifyUserAppsData(userApps.apps[0], "com.whatever.package1", "app1");
                        verifyUserAppsData(userApps.apps[1], "com.whatever.package2", "app2");
                        done();
                    })
                });
        });

        const verifyUserAppsData = (app, packageName, appName) => {
            app.packageName.should.be.eql(packageName);
            app.appName.should.be.eql(appName);
        };

        afterEach((done) => {
            UserApps.remove({userId : config.testUser.userId},() => {
                done();
            });
        });
    });
});