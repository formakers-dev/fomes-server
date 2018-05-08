const jwt = require('jsonwebtoken');
const config = require('../config');
const should = require('chai').should();
const Users = require('../models/user');
const InvitationCodes = require('../models/invitationCodes');
require('./setupSinon')();

const server = require('../server');
const request = require('supertest').agent(server);

describe('Users', () => {

    describe('POST /user/', () => {
        let testUser = config.testUser;
        testUser.registrationToken = 'new_user_token';

        it('User정보를 저장한다', done => {
            request.post('/user')
                .set('x-access-token', config.appbeeToken.valid)
                .send(testUser)
                .expect(200)
                .then(() => {
                    Users.findOne({userId: testUser.userId}, (err, user) => {
                        user.userId.should.be.eql('109974316241227718963');
                        user.gender.should.be.eql("male");
                        user.email.should.be.eql("appbee@appbee.com");
                        user.registrationToken.should.be.eql('new_user_token');
                        done();
                    });
                })
                .catch(err => done(err));
        });

        describe('기존 사용자가 존재할 경우,', () => {
            before(done => {
                Users.create(config.testUser, done);
            });

            it('User의 특정 정보를 업데이트 한다', done => {
                const newToken = {
                    registrationToken: "NEW_CODE"
                };

                request.post('/user')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(newToken)
                    .expect(200)
                    .then(() => {
                        return Users.findOne({userId: config.testUser.userId});
                    })
                    .then((result) => {
                        result.registrationToken.should.be.eql("NEW_CODE");
                        result.userId.should.be.eql(config.testUser.userId);
                        done();
                    }).catch(err => done(err));
            });

            after(done => {
                Users.remove({}, done);
            })
        });

        afterEach((done) => {
            Users.remove({userId: config.testUser.userId}, () => {
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
            registrationToken: 'new_registration_token',
            provider: null,
            providerId: null,
            signUpCode: {
                type: 'beta',
                value: 'TEST_BETA_CODE'
            }
        };

        before(done => {
            Users.create(config.testUser, done);
        });

        it('구글토큰검증 후 User정보를 업데이트한다', done => {
            request.post('/user/auth')
                .set('x-id-token', config.testUser.googleIdToken)
                .send(signInUser)
                .expect(200)
                .then((res) => {
                    res.body.should.be.not.null;
                    Users.findOne({userId: config.testUser.userId}, (err, user) => {
                        user.userId.should.be.eql(config.testUser.userId);
                        user.name.should.be.eql('testName');
                        user.email.should.be.eql('test@email.com');
                        user.birthday.should.be.eql(1980);
                        user.gender.should.be.eql('female');
                        user.provider.should.be.eql('google');
                        user.providerId.should.be.eql("109974316241227718963");
                        user.registrationToken.should.be.eql('new_registration_token');
                        user.signUpCode.type.should.be.eql('beta');
                        user.signUpCode.value.should.be.eql('TEST_BETA_CODE');
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
            Users.remove({userId: config.testUser.userId}, done);
        });
    });
});