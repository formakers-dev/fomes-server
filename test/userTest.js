const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const config = require('../config');
const should = require('chai').should();
const User = require('../models/user').User;
const UserConstants = require('../models/user').Constants;
const UserController = require('../controller/user');
const InvitationCodes = require('../models/invitationCodes');
require('./setupSinon')();

const server = require('../server');
const request = require('supertest').agent(server);

describe('Users', () => {
    const sandbox = sinon.sandbox.create();

    describe('POST /user/', () => {
        let testUser = config.testUser;

        it('User정보를 저장한다', done => {
            request.post('/user')
                .set('x-access-token', config.appbeeToken.valid)
                .send(testUser)
                .expect(200)
                .then(() => {
                    User.findOne({userId: testUser.userId}, (err, user) => {
                        user.userId.should.be.eql('109974316241227718963');
                        user.gender.should.be.eql("male");
                        user.email.should.be.eql("appbee@appbee.com");
                        user.registrationToken.should.be.eql('test_user_registration_token');
                        user.lifeApps.length.should.be.eql(2);
                        user.lifeApps[0].should.be.eql('fomes');
                        user.lifeApps[1].should.be.eql('appbee');
                        user.nickName.should.be.eql('test_user_nickname');
                        user.birthday.should.be.eql(1992);
                        user.job.should.be.eql('IT종사자');
                        done();
                    });
                })
                .catch(err => done(err));
        });

        describe('기존 사용자가 존재할 경우,', () => {
            before(done => {
                User.create(config.testUser, done);
            });

            it('User의 특정 정보를 업데이트 한다', done => {
                const newToken = {
                    registrationToken: "NEW_CODE",
                    lifeApps: [ 'newApp' ],
                    nickName: 'new_nickname',
                };

                request.post('/user')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(newToken)
                    .expect(200)
                    .then(() => {
                        return User.findOne({userId: config.testUser.userId});
                    })
                    .then((result) => {
                        result.userId.should.be.eql('109974316241227718963');
                        result.gender.should.be.eql("male");
                        result.email.should.be.eql("appbee@appbee.com");
                        result.registrationToken.should.be.eql("NEW_CODE");
                        result.lifeApps.length.should.be.eql(1);
                        result.lifeApps[0].should.be.eql('newApp');
                        result.nickName.should.be.eql('new_nickname');
                        result.birthday.should.be.eql(1992);
                        result.job.should.be.eql('IT종사자');
                        done();
                    }).catch(err => done(err));
            });

            after(done => {
                User.remove({}, done);
            })
        });

        afterEach((done) => {
            User.remove({userId: config.testUser.userId}, () => {
                done();
            });
        });
    });

    describe('GET /user/verifyToken', () => {
        it('토큰이 유효한 경우 200을 리턴한다', done => {
            request.get('/user/verifyToken')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(200, done);
        });

        it('토큰이 만료된 경우 401을 리턴한다', done => {
            request.get('/user/verifyToken')
                .set('x-access-token', config.appbeeToken.expired)
                .send()
                .expect(401, done);
        });

        it('토큰이 잘못된 경우 403을 리턴한다', done => {
            request.get('/user/verifyToken')
                .set('x-access-token', config.appbeeToken.invalid)
                .send()
                .expect(403, done);
        });
    });

    describe('GET /user/verifyInvitationCode/{code}', () => {
        before(done => {
            InvitationCodes.create({code: 'VALIDCODE'}, done);
        });

        it('등록코드가 유효한 경우 true를 리턴한다', done => {
            request.get('/user/verifyInvitationCode/VALIDCODE')
                .send()
                .expect(200, done);
        });

        it('등록코드가 유효하지 않은 경우 false를 리턴한다', done => {
            request.get('/user/verifyInvitationCode/INVALIDCODE')
                .send()
                .expect(412, done);
        });

        after(done => {
            InvitationCodes.remove({}, done);
        });
    });

    describe('POST /user/auth/', () => {
        const signInUser = {
            userId : null,
            name: null,
            email : null,
            birthday: 1980,
            gender: 'female',
            job: '학생',
            registrationToken: 'new_registration_token',
            provider: null,
            providerId: null
        };

        before(done => {
            User.create(config.testUser, done);
        });

        it('구글토큰검증 후 User정보를 업데이트한다', done => {
            request.post('/user/auth')
                .set('x-id-token', config.testUser.googleIdToken)
                .send(signInUser)
                .expect(200)
                .then((res) => {
                    res.body.should.be.not.null;
                    User.findOne({userId: config.testUser.userId}, (err, user) => {
                        user.userId.should.be.eql(config.testUser.userId);
                        user.name.should.be.eql('testName');
                        user.email.should.be.eql('test@email.com');
                        user.birthday.should.be.eql(1980);
                        user.job.should.be.eql('학생');
                        user.gender.should.be.eql('female');
                        user.provider.should.be.eql('google');
                        user.providerId.should.be.eql("109974316241227718963");
                        user.registrationToken.should.be.eql('new_registration_token');
                        done();
                    });
                })
                .catch(err => done(err));
        });

        it('구글토큰검증 후 AppBeeToken을 발급하여 리턴한다', done => {
            request.post('/user/auth')
                .set('x-id-token', config.testUser.googleIdToken)
                .send(signInUser)
                .expect(200)
                .then((res) => {
                    const appBeeToken = res.body;

                    jwt.verify(appBeeToken, config.secret, (err, decoded) => {
                        if(!err) {
                            decoded.userId.should.be.eql(config.testUser.userId);
                            done();
                        } else {
                            done('Invalid AppBee token is generated!!!');
                        }
                    });
                })
                .catch(err => done(err));
        });

        afterEach((done) => {
            User.remove({userId: config.testUser.userId}, done);
        });
    });

    describe('POST /user/signup/', () => {
        let clock;
        const signUpUser = config.testUser;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2018-09-06T15:30:00.000Z").getTime());
        });

        it('구글토큰검증 후 User 를 가입시킨다', done => {
            request.post('/user/signup')
                .set('x-id-token', config.testUser.googleIdToken)
                .send(signUpUser)
                .expect(200)
                .then((res) => {
                    User.findOne({userId: config.testUser.userId}).then(user => {
                        user.userId.should.be.eql(config.testUser.userId);
                        user.name.should.be.eql('testName');
                        user.email.should.be.eql('test@email.com');
                        user.birthday.should.be.eql(1992);
                        user.job.should.be.eql('IT종사자');
                        user.gender.should.be.eql('male');
                        user.provider.should.be.eql('google');
                        user.providerId.should.be.eql("109974316241227718963");
                        user.registrationToken.should.be.eql('test_user_registration_token');
                        user.signUpTime.should.be.eql(new Date('2018-09-06T15:30:00.000Z'));
                        done();
                    }).catch(err => done(err));
                }).catch(err => done(err));
        });

        it('구글토큰검증 후 AppBeeToken을 발급하여 리턴한다', done => {
            request.post('/user/signup')
                .set('x-id-token', config.testUser.googleIdToken)
                .send(signUpUser)
                .expect(200)
                .then((res) => {
                    const appBeeToken = res.body;

                    jwt.verify(appBeeToken, config.secret, (err, decoded) => {
                        if(!err) {
                            decoded.userId.should.be.eql(config.testUser.userId);
                            done();
                        } else {
                            done('Invalid AppBee token is generated!!!');
                        }
                    });
                })
                .catch(err => done(err));
        });

        describe('이미 가입되어 있을 경우,', () => {
            let oldUser = {
                userId: config.testUser.userId,
                name: 'oldName',
                email: 'old@email.com',
                birthday: 1900,
                job: 'oldJob',
                gender: 'female',
                registrationToken: 'oldRegistrationToken',
                signUpTime: new Date('2018-09-05T15:30:00.000Z'),
            };

            before(done => {
                User.create(oldUser, done);
            });

            it('signUpTime을 제외한 나머지 정보들을 업데이트 한다', done => {
                request.post('/user/signup')
                    .set('x-id-token', config.testUser.googleIdToken)
                    .send(signUpUser)
                    .expect(200)
                    .then((res) => {
                        User.findOne({userId: config.testUser.userId}, (err, user) => {
                            if (err) done(err);

                            user.userId.should.be.eql(config.testUser.userId);
                            user.name.should.be.eql('testName');
                            user.email.should.be.eql('test@email.com');
                            user.birthday.should.be.eql(1992);
                            user.job.should.be.eql('IT종사자');
                            user.gender.should.be.eql('male');
                            user.provider.should.be.eql('google');
                            user.providerId.should.be.eql("109974316241227718963");
                            user.registrationToken.should.be.eql('test_user_registration_token');
                            user.signUpTime.should.be.eql(new Date('2018-09-05T15:30:00.000Z'));
                            done();
                        });
                    })
                    .catch(err => done(err));
            });

            after(done => {
                User.remove({userId: config.testUser.userId}, done);
            })
        });

        afterEach((done) => {
            clock.restore();
            User.remove({userId: config.testUser.userId}, done);
        });
    });

    describe('getSimilarUsersWithSameAge 호출 시', () => {
        let clock;

        before(done => {
            User.create([
                config.testUser,
                {
                    userId: "userId1",
                    gender: "female",
                    birthday: 1969,
                    job: "IT종사자"
                },
                {
                    userId: "userId2",
                    gender: "male",
                    birthday: 1999,
                    job: "주부"
                },
                {
                    userId: "userId3",
                    gender: "male",
                    birthday: 1989,
                    job: "IT종사자"
                }
            ], () => {
                clock = sandbox.useFakeTimers(new Date("2018-09-21T15:30:00.000Z").getTime());
                done();
            });
        });

        it('동일 성별 + 동일 나이대의 유저들 리스트를 반환한다',  done => {
            UserController.getSimilarUsers(config.testUser, UserConstants.gender | UserConstants.age)
                .then(users => {
                    users.length.should.be.eql(3);

                    users.sort((a, b) => a.birthday > b.birthday ? 1 : -1);

                    users[0].userId.should.be.eql("userId3");
                    users[0].gender.should.be.eql("male");
                    users[0].birthday.should.be.eql(1989);
                    users[0].job.should.be.eql("IT종사자");

                    users[1].userId.should.be.eql(config.testUser.userId);
                    users[1].gender.should.be.eql("male");
                    users[1].birthday.should.be.eql(1992);
                    users[1].job.should.be.eql("IT종사자");

                    users[2].userId.should.be.eql("userId2");
                    users[2].gender.should.be.eql("male");
                    users[2].birthday.should.be.eql(1999);
                    users[2].job.should.be.eql("주부");

                    done();
                }).catch(err => done(err));
        });

        it('동일 직업군 유저들 리스트를 반환한다',  done => {
            UserController.getSimilarUsers(config.testUser, UserConstants.job)
                .then(users => {
                    users.length.should.be.eql(3);

                    users.sort((a, b) => a.birthday > b.birthday ? 1 : -1);
                    console.log(users);

                    users[0].userId.should.be.eql("userId1");
                    users[0].gender.should.be.eql("female");
                    users[0].birthday.should.be.eql(1969);
                    users[0].job.should.be.eql("IT종사자");

                    users[1].userId.should.be.eql("userId3");
                    users[1].gender.should.be.eql("male");
                    users[1].birthday.should.be.eql(1989);
                    users[1].job.should.be.eql("IT종사자");

                    users[2].userId.should.be.eql(config.testUser.userId);
                    users[2].gender.should.be.eql("male");
                    users[2].birthday.should.be.eql(1992);
                    users[2].job.should.be.eql("IT종사자");

                    done();
                }).catch(err => done(err));
        });

        after(done => {
            clock.restore();
            User.remove({}, done);
        });
    });
});
