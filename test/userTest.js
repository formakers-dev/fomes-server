const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const expect = chai.expect;
const Users = require('../models/user');
require('./setupSinon')();
const server = require('../server');
const UserApps = require('../models/userApps');

chai.use(chaiHttp);

describe('Users', () => {
    describe('GET user auth', () => {
        const newUser = {
            userId: config.testAppbeeNumber,
            firstUsedDate: "20170828",
            lastUsedDate: "20170828"
        };
        const oldUser = {
            userId: config.testAppbeeNumber,
            lastUsedDate: "20170829"
        };

        it('새로운 사용자일 경우, 유저정보를 정상적으로 저장한다', done => {
            Users.findOneAndUpdate({userId: newUser.userId}, {$set: newUser}, {upsert: true})
                .exec()
                .then(() => {
                    Users.findOne({userId: newUser.userId}, (err, user) => {
                        verifyUserData(user, config.testAppbeeNumber, "20170828", "20170828");
                        done();
                    });

                });
        });

        it('기존 사용자일 경우, 유저정보를 정상적으로 업데이트한다', done => {
            Users.findOneAndUpdate({userId: newUser.userId}, {$set: newUser}, {upsert: true})
                .exec()
                .then(() => {
                    Users.findOneAndUpdate({userId: oldUser.userId}, {$set: oldUser}, {upsert: true})
                        .exec()
                        .then(() => {
                            Users.findOne({userId: oldUser.userId}, (err, user) => {
                                verifyUserData(user, config.testAppbeeNumber, "20170828", "20170829");
                                done();
                            });
                        });
                });
        });

        const verifyUserData = (user, userId, firstUsedDate, lastUsedDate) => {
            user.userId.should.be.eql(userId);
            user.firstUsedDate.should.be.eql(firstUsedDate);
            user.lastUsedDate.should.be.eql(lastUsedDate);
        };

        afterEach((done) => {
            Users.remove({ userId : config.testAppbeeNumber }, () => {
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
                .set('x-appbee-number', config.testAppbeeNumber)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    UserApps.findOne({userId: config.testAppbeeNumber}, (err, userApps) => {
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
            UserApps.remove({userId : config.testAppbeeNumber},() => {
                done();
            });
        });
    });

});