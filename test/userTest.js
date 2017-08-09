const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const Users = require('../models/user');
const jwt = require('jsonwebtoken');
require('./setupSinon')();
const server = require('../server');

chai.use(chaiHttp);

describe('Users', () => {
    describe('GET user auth', () => {
        const newUser = {
            userId: 'testUserId',
            provider: 'google',
            name: '테스트유저',
            email: 'appbee0627@gmail.com'
        };
        const oldUser = {
            userId: 'testUserId',
            provider: 'facebook',
            name: '이름변경된테스트유저',
            email: 'appbee1231@gmail.com'
        };
        it('google id토큰 검증 후 API 사용을 위한 appbee 토큰을 발급하여 리턴한다', done => {
            chai.request(server)
                .get('/user/auth')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.include('.');
                    done();
                });
        });

        it('리턴되는 appbee 토큰은 유효한 토큰이어야 한다', done => {
            chai.request(server)
                .get('/user/auth')
                .end((err, res) => {
                    jwt.verify(res.body, config.secret, (err) => {
                        expect(!err).to.be.true;
                        done();
                    });
                });
        });

        it('새로운 사용자일 경우, 유저정보를 정상적으로 저장한다', done => {
            Users.findOneAndUpdate({userId: newUser.userId}, {$set: newUser}, {upsert: true})
                .exec()
                .then(() => {
                    Users.findOne({userId: newUser.userId}, (err, user) => {
                        verifyUserData(user, "testUserId", "google", "테스트유저", "appbee0627@gmail.com");
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
                                verifyUserData(user, "testUserId", "facebook", "이름변경된테스트유저", "appbee1231@gmail.com");
                                done();
                            });
                        });
                });
        });

        const verifyUserData = (user, userId, provider, name, email) => {
            user.userId.should.be.eql(userId);
            user.provider.should.be.eql(provider);
            user.name.should.be.eql(name);
            user.email.should.be.eql(email);
        };

        afterEach((done) => {
            Users.remove({ userId : config.testUserId }, () => {
                done();
            });
        });
    });
});