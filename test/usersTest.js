const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const config = require('../config');
const should = require('chai').should();
const Users = require('../models/users').Users;
const Apps = require('../models/appUsages').Apps;
const UserConstants = require('../models/users').Constants;
const UserService = require('../services/users');
const helper = require('./commonTestHelper');
helper.setupSinon();

const server = require('../server');
const request = require('supertest').agent(server);

describe('Users', () => {
    before(done => {
        helper.commonBefore()
            .then(() => done())
            .catch(err => done(err));
    });

    const sandbox = sinon.sandbox.create();

    describe('POST /user/', () => {
        describe('기존 사용자가 존재할 경우,', () => {
            it('User의 특정 정보를 업데이트 한다', done => {
                const newToken = {
                    registrationToken: "NEW_CODE",
                    lifeApps: ['newApp'],
                    nickName: 'new_nickname',
                };

                request.post('/user')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(newToken)
                    .expect(200)
                    .then(() => Users.findOne({userId: config.testUser.userId}))
                    .then((result) => {
                        result.userId.should.be.eql('109974316241227718963');
                        result.gender.should.be.eql("male");
                        result.email.should.be.eql("appbee@appbee.com");
                        result.registrationToken.should.be.eql("NEW_CODE");
                        result.lifeApps.length.should.be.eql(1);
                        result.lifeApps[0].should.be.eql('newApp');
                        result.nickName.should.be.eql('new_nickname');
                        result.birthday.should.be.eql(1992);
                        result.job.should.be.eql(1);
                        done();
                    }).catch(err => done(err));
            });
        });

        describe('본인을 제외한 다른 사용자와 닉네임이 중복될 경우,', () => {
            before(done => {
                Users.create([
                    {
                        userId: 'testUserId1',
                        nickName: 'duplicatedNickName'  // testUser 와 같은 닉네임
                    }
                ], done);
            });

            it('409를 반환한다', done => {
                request.post('/user')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send({
                        userId: config.testUser.userId,
                        nickName: 'duplicatedNickName'
                    })
                    .expect(409, done);
            });

            after(done => {
                Users.remove({userId : {$ne : config.testUser.userId}}, done);
            });
        });
    });

    describe('GET /user/verifyToken', () => {
        describe('요청한 유저가 존재하는 경우' , () => {
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

        describe('요청한 유저가 존재하지 않는 경우' , () => {
            before(done => {
                Users.remove({}, done);
            });

            it('토큰의 유효성과 관련없이, 403을 리턴한다', done => {
                request.get('/user/verifyToken')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send()
                    .expect(403, done);
            });

            after(done => {
                Users.create(config.testUser, done);
            });
        });
    });

    describe('GET /user/verify/info', () => {
        before(done => {
            Users.create([
                {
                    userId: 'testUserId1',
                    nickName: 'duplicatedNickName'  // testUser 와 같은 닉네임
                }
            ], done);
        });

        it('전달된 닉네임이 존재하지 않으면 200를 리턴한다', done => {
            request.get('/user/verify/info?nickName=new_nickname')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(200, done);
        });

        it('전달된 닉네임이 이미 존재하는 경우 409를 리턴한다', done => {
            request.get('/user/verify/info?nickName=duplicatedNickName')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(409, done);
        });

        it('전달된 닉네임이 존재하지만 본인의 닉네임인 경우에는 200를 리턴한다', done => {
            request.get('/user/verify/info?nickName=test_user_nickname')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(200, done);
        });

        it('전달된 파라미터가 없는 경우 422를 리턴한다', done => {
            request.get('/user/verify/info')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(422, done);
        });

        after(done => {
            // Users.remove({userId : {$ne : config.testUser.userId}}, done);
            Users.remove({}, done);
        });
    });

    describe('POST /user/signin/', () => {
        const signInUser = {
            userId: null,
            name: null,
            email: null,
            birthday: 1980,
            gender: 'female',
            job: 3,
            registrationToken: 'new_registration_token',
            provider: null,
            providerId: null
        };

        before(done => {
            Users.create(config.testUser, done);
        });

        it('구글토큰검증 후 User정보를 업데이트한다', done => {
            request.post('/user/signin')
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
                        user.job.should.be.eql(3);
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
            request.post('/user/signin')
                .set('x-id-token', config.testUser.googleIdToken)
                .send(signInUser)
                .expect(200)
                .then((res) => {
                    const appBeeToken = res.body;

                    jwt.verify(appBeeToken, config.secret, (err, decoded) => {
                        if (!err) {
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

    describe('POST /user/signup/', () => {
        let clock;
        const signUpUser = {
            userId: config.testUser.userId,
            name: config.testUser.name,
            email: config.testUser.email,
            registrationToken: config.testUser.registrationToken,
            provider: config.testUser.provider,
            providerId: config.testUser.providerId
        };

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2018-09-06T15:30:00.000Z").getTime());
        });

        it('구글토큰검증 후 유저를 가입시킨다', done => {
            request.post('/user/signup')
                .set('x-id-token', config.testUser.googleIdToken)
                .send(signUpUser)
                .expect(200)
                .then(() => {
                    Users.findOne({userId: config.testUser.userId}).then(user => {
                        user.userId.should.be.eql(config.testUser.userId);
                        user.name.should.be.eql('testName');
                        user.email.should.be.eql('test@email.com');
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
                        if (!err) {
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
                registrationToken: 'oldRegistrationToken',
                provider: 'oldProvider',
                providerId: 'oldProviderId',
                signUpTime: new Date('2018-09-05T15:30:00.000Z'),
            };

            before(done => {
                Users.create(oldUser, done);
            });

            it('signUpTime을 제외한 나머지 정보들을 업데이트 한다', done => {
                request.post('/user/signup')
                    .set('x-id-token', config.testUser.googleIdToken)
                    .send(signUpUser)
                    .expect(200)
                    .then(() => {
                        Users.findOne({userId: config.testUser.userId}, (err, user) => {
                            if (err) done(err);

                            user.userId.should.be.eql(config.testUser.userId);
                            user.name.should.be.eql('testName');
                            user.email.should.be.eql('test@email.com');
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
                Users.remove({userId: config.testUser.userId}, done);
            })
        });

        afterEach((done) => {
            clock.restore();
            Users.remove({userId: config.testUser.userId}, done);
        });
    });

    // TODO : service unit test 추가할건지 결정 후 처리하기
    describe.skip('getSimilarUsersWithSameAge 호출 시', () => {
        let clock;

        before(done => {
            Users.create([
                config.testUser,
                {
                    userId: "userId1",
                    gender: "female",
                    birthday: 1969,
                    job: 1
                },
                {
                    userId: "userId2",
                    gender: "male",
                    birthday: 1999,
                    job: 2
                },
                {
                    userId: "userId3",
                    gender: "male",
                    birthday: 1989,
                    job: 1
                }
            ], () => {
                clock = sandbox.useFakeTimers(new Date("2018-09-21T15:30:00.000Z").getTime());
                done();
            });
        });

        it('동일 성별 + 동일 나이대의 유저들 리스트를 반환한다', done => {
            UserService.getSimilarUsers(config.testUser, UserConstants.gender | UserConstants.age)
                .then(users => {
                    users.length.should.be.eql(3);

                    users.sort((a, b) => a.birthday > b.birthday ? 1 : -1);

                    users[0].userId.should.be.eql("userId3");
                    users[0].gender.should.be.eql("male");
                    users[0].birthday.should.be.eql(1989);
                    users[0].job.should.be.eql(1);

                    users[1].userId.should.be.eql(config.testUser.userId);
                    users[1].gender.should.be.eql("male");
                    users[1].birthday.should.be.eql(1992);
                    users[1].job.should.be.eql(1);

                    users[2].userId.should.be.eql("userId2");
                    users[2].gender.should.be.eql("male");
                    users[2].birthday.should.be.eql(1999);
                    users[2].job.should.be.eql(2);

                    done();
                }).catch(err => done(err));
        });

        it('동일 직업군 유저들 리스트를 반환한다', done => {
            UserService.getSimilarUsers(config.testUser, UserConstants.job)
                .then(users => {
                    users.length.should.be.eql(3);

                    users.sort((a, b) => a.birthday > b.birthday ? 1 : -1);

                    users[0].userId.should.be.eql("userId1");
                    users[0].gender.should.be.eql("female");
                    users[0].birthday.should.be.eql(1969);
                    users[0].job.should.be.eql(1);

                    users[1].userId.should.be.eql("userId3");
                    users[1].gender.should.be.eql("male");
                    users[1].birthday.should.be.eql(1989);
                    users[1].job.should.be.eql(1);

                    users[2].userId.should.be.eql(config.testUser.userId);
                    users[2].gender.should.be.eql("male");
                    users[2].birthday.should.be.eql(1992);
                    users[2].job.should.be.eql(1);

                    done();
                }).catch(err => done(err));
        });

        after(done => {
            clock.restore();
            Users.remove({}, done);
        });
    });

    describe('POST /user/wishlist/', () => {
        const requestBody = {
            packageName: 'com.test.expected'
        };

        const appInfo = {
            packageName: 'com.test.expected'
        };

        describe('정상 케이스', function () {
            beforeEach(done => {
                config.testUser.wishList = ['com.test.one', 'com.test.two'];

                Users.create(config.testUser)
                    .then(() => Apps.create(appInfo))
                    .then(() => done())
                    .catch(err => done(err));
            });

            it('요청한 유저의 보관함에 요청된 앱을 추가한다', done => {
                request.post('/user/wishlist/')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(requestBody)
                    .expect(200)
                    .then(() => Users.findOne({userId: config.testUser.userId}))
                    .then(user => {
                        user.wishList.length.should.be.eql(3);
                        user.wishList.should.be.includes('com.test.expected');
                        return Apps.findOne({packageName: 'com.test.expected'})
                    })
                    .then(app => {
                        app.wishedBy.length.should.be.eql(1);
                        app.wishedBy[0].should.be.eql(config.testUser.userId);
                    })
                    .then(() => done())
                    .catch(err => done(err));
            });

            afterEach(done => {
                Users.remove({})
                    .then(() => Apps.remove({}))
                    .then(() => done())
                    .catch(err => done(err));
            });
        });


        describe('요청한 앱이 위시리스트에 이미 존재하는 경우', () => {
            beforeEach(done => {
                config.testUser.wishList = ['com.test.expected'];

                Users.create(config.testUser)
                    .then(() => Apps.create(appInfo))
                    .then(() => done())
                    .catch(err => done(err));
            });

            it('해당 데이터를 업데이트 한다', done => {
                request.post('/user/wishlist/')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(requestBody)
                    .expect(200)
                    .then(() => Users.findOne({userId: config.testUser.userId}))
                    .then(user => {
                        user.wishList.length.should.be.eql(1);
                        user.wishList[0].should.be.eql('com.test.expected');
                        return Apps.findOne({packageName: 'com.test.expected'})
                    })
                    .then(app => {
                        app.wishedBy.length.should.be.eql(1);
                        app.wishedBy[0].should.be.eql(config.testUser.userId);
                    })
                    .then(() => done())
                    .catch(err => done(err));
            });

            afterEach(done => {
                Users.remove({})
                    .then(() => Apps.remove({}))
                    .then(() => done())
                    .catch(err => done(err));
            });
        });
    });

    describe('DELETE /user/wishlist/{packageName}', () => {
        const appInfo = [{
            packageName: 'com.test.one',
            wishedBy: [config.testUser.userId]
        }, {
            packageName: 'com.test.two',
            wishedBy: [config.testUser.userId, 'user007']
        }, {
            packageName: 'com.test.unregistered',
        }];

        describe('정상 케이스', function () {
            beforeEach(done => {
                config.testUser.wishList = ['com.test.one', 'com.test.two'];

                Users.create(config.testUser)
                    .then(() => Apps.create(appInfo))
                    .then(() => done())
                    .catch(err => done(err));
            });

            it('요청한 유저의 보관함에서 요청된 앱을 삭제한다', done => {
                request.delete('/user/wishlist/com.test.one')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send()
                    .expect(200)
                    .then(() => Users.findOne({userId: config.testUser.userId}))
                    .then(user => {
                        user.wishList.length.should.be.eql(1);
                        user.wishList.should.be.includes('com.test.two');
                        return Apps.findOne({packageName: 'com.test.one'})
                    })
                    .then(app => {
                        app.wishedBy.length.should.be.eql(0);
                    })
                    .then(() => done())
                    .catch(err => done(err));
            });

            afterEach(done => {
                Users.remove({})
                    .then(() => Apps.remove({}))
                    .then(() => done())
                    .catch(err => done(err));
            });
        });
    });

    describe('GET /user/wishlist/', () => {
        beforeEach(done => {
            config.testUser.wishList = ['com.game.edu', 'com.game.edu2'];

            Users.create(config.testUser)
                .then(() => Apps.create([
                    {
                        packageName: 'com.game.edu',
                        appName: '교육게임명',
                        developer: 'Edu Game Corp.',
                        categoryId1: 'GAME_EDUCATIONAL',
                        categoryName1: '교육',
                        iconUrl: 'iconUrl3',
                        wishedBy: [config.testUser.userId, 'user2']
                    }, {
                        packageName: 'com.game.rpg',
                        appName: '롤플레잉게임명',
                        developer: 'GameDuckHu Corp.',
                        categoryId1: 'GAME_ROLE_PLAYING',
                        categoryName1: '롤플레잉',
                        iconUrl: 'iconUrl4',
                        wishedBy: ['user3']
                    }, {
                        packageName: 'com.game.edu2',
                        appName: '교육게임명2',
                        developer: 'GameDuckHu Corp.',
                        categoryId1: 'GAME_EDUCATIONAL',
                        categoryName1: '교육',
                        iconUrl: 'iconUrl32',
                        wishedBy: [config.testUser.userId]
                    }]))
                .then(() => done())
                .catch(err => done(err))
        });

        it('등록된 위시리스트를 반환한다', done => {
            request.get('/user/wishlist')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then((res) => {
                    res.body.length.should.be.eql(2);

                    res.body = res.body.sort((a, b) => a.packageName > b.packageName);

                    res.body[0].packageName.should.be.eql('com.game.edu');
                    res.body[0].appName.should.be.eql('교육게임명');
                    res.body[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                    res.body[0].categoryName.should.be.eql('교육');
                    res.body[0].developer.should.be.eql('Edu Game Corp.');
                    res.body[0].iconUrl.should.be.eql('iconUrl3');
                    res.body[0].isWished.should.be.eql(true);

                    res.body[1].packageName.should.be.eql('com.game.edu2');
                    res.body[1].appName.should.be.eql('교육게임명2');
                    res.body[1].categoryId.should.be.eql('GAME_EDUCATIONAL');
                    res.body[1].categoryName.should.be.eql('교육');
                    res.body[1].developer.should.be.eql('GameDuckHu Corp.');
                    res.body[1].iconUrl.should.be.eql('iconUrl32');
                    res.body[1].isWished.should.be.eql(true);

                    done();
                }).catch(err => done(err));
        });

        describe('위시리스트가 없는 경우', () => {
            beforeEach(done => {
                Users.findOneAndUpdate({userId: config.testUser.userId}, {wishList: []})
                    .then(() => done());
            });

            it('빈 위시리스트를 반환한다', done => {
                request.get('/user/wishlist')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(200)
                    .then((res) => {
                        res.body.length.should.be.eql(0);

                        done();
                    }).catch(err => done(err));
            });
        });

        afterEach(done => {
            Users.remove({})
                .then(() => Apps.remove({}))
                .then(() => done())
                .catch(err => done(err));
        });
    });

    after(done => {
        helper.commonAfter()
            .then(() => done())
            .catch(err => done(err));
    })
});
