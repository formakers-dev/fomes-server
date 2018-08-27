const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const sinon = require('sinon');
const ShortTermStats = require('../models/shortTermStats');
const Users = require('../models/user');
const { AppUsages, Apps } = require('../models/appUsages');

describe('Stats', () => {
    const sandbox = sinon.sandbox.create();

    describe('POST /stats/short', () => {
        const doc = [{
            "packageName": "com.whatever.package1",
            "startTimeStamp": 1499914700000,
            "endTimeStamp": 1499914800000,
            "totalUsedTime": 100000
        },
            {
                "packageName": "com.whatever.package2",
                "startTimeStamp": 1499914700001,
                "endTimeStamp": 1499914900001,
                "totalUsedTime": 200000
            }];

        describe('단기통계데이터를 성공적으로 저장하면', () => {
            it('200을 리턴하고 데이터가 저장된다', (done) => {
                request.post("/stats/short")
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(doc)
                    .expect(200)
                    .then(() => ShortTermStats.find({userId: config.testUser.userId}).sort({packageName: 1}))
                    .then(shortTermStats => {
                        shortTermStats.length.should.be.eql(2);
                        verifyShortTermStatData(shortTermStats[0], 'com.whatever.package1', 1499914700000, 1499914800000, 100000);
                        verifyShortTermStatData(shortTermStats[1], 'com.whatever.package2', 1499914700001, 1499914900001, 200000);

                        done();
                    })
                    .catch((err) => done(err));
            });

            it('해당 유저 정보에 마지막 통계 정보 업데이트 시간이 기록된다.', (done) => {
                sandbox.useFakeTimers(new Date("2018-05-02T13:30:00.000Z").getTime());

                request.post("/stats/short")
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(doc)
                    .expect(200)
                    .then(() => Users.findOne({userId: config.testUser.userId}))
                    .then(user => {
                        user.lastStatsUpdateTime.should.be.eql(new Date("2018-05-02T13:30:00.000Z"));
                        done();
                    })
                    .catch((err) => done(err));
            });
        });

        it('기존에 존재하는 단기통계데이터가 있으면 덮어쓰지 않고 추가한다', (done) => {
            const newDoc = [{
                "packageName": "com.whatever.package1",
                "startTimeStamp": 1499914700002,
                "endTimeStamp": 1499914800002,
                "totalUsedTime": 100002
            }];

            request.post("/stats/short")
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .expect(200)
                .then(() => {
                    request.post("/stats/short")
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(newDoc)
                        .expect(200)
                        .then(() => ShortTermStats.find({userId: config.testUser.userId}).sort({startTimeStamp: 1}))
                        .then(shortTermStats => {
                            shortTermStats.length.should.be.eql(3);
                            verifyShortTermStatData(shortTermStats[0], 'com.whatever.package1', 1499914700000, 1499914800000, 100000);
                            verifyShortTermStatData(shortTermStats[1], 'com.whatever.package2', 1499914700001, 1499914900001, 200000);
                            verifyShortTermStatData(shortTermStats[2], 'com.whatever.package1', 1499914700002, 1499914800002, 100002);

                            done();
                        }).catch((err) => done(err))
                }).catch((err) => done(err));
        });

        it('단기통계데이터를 잘못된 형태로 전송한 경우, 400 에러코드를 리턴한다.', done => {
            request.post('/stats/short')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });

        it('빈 단기통계데이터를 전송한 경우, 아무 처리없이 200을 리턴한다.', done => {
            request.post("/stats/short")
                .set('x-access-token', config.appbeeToken.valid)
                .send([])
                .expect(200)
                .then(() => ShortTermStats.find({userId: config.testUser.userId}))
                .then(shortTermStats => {
                    shortTermStats.length.should.be.eql(0);
                    done();
                }).catch((err) => done(err));
        });

        const verifyShortTermStatData = (shortTermStat, packageName, startTimeStamp, endTimeStamp, totalUsedTime) => {
            shortTermStat.packageName.should.be.eql(packageName);
            shortTermStat.startTimeStamp.should.be.eql(startTimeStamp);
            shortTermStat.endTimeStamp.should.be.eql(endTimeStamp);
            shortTermStat.totalUsedTime.should.be.eql(totalUsedTime);
        };
    });

    afterEach((done) => {
        ShortTermStats.remove({userId: config.testUser.userId}, () => {
            sandbox.restore();
            done();
        });
    });

    describe('POST /stats/usages/app', () => {

        beforeEach(done => {
            AppUsages.create([{
                userId: 'anotherUserId',
                packageName: 'com.pre.installed',
                totalUsedTime: 9999
            }, {
                userId: config.testUser.userId,
                packageName: 'com.kakao.talk',
                totalUsedTime: 40000
            }], function () {
                done()
            });
        });

        const data = [{
            packageName: 'com.kakao.talk',
            totalUsedTime: 10000,
        }, {
            packageName: 'com.naver.talk',
            totalUsedTime: 20000,
        }, {
            packageName: 'com.android.com',
            totalUsedTime: 30000,
        }];

        it('앱사용기록을 저장한다', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send(data)
                .expect(200)
                .then(() => AppUsages.find({userId: config.testUser.userId}).exec())
                .then(docs => {
                    docs.length.should.be.eql(3);
                    docs[0].userId.should.be.eql(config.testUser.userId);
                    docs[0].packageName.should.be.eql('com.kakao.talk');
                    docs[0].totalUsedTime.should.be.eql(10000);
                    docs[1].userId.should.be.eql(config.testUser.userId);
                    docs[1].packageName.should.be.eql('com.naver.talk');
                    docs[1].totalUsedTime.should.be.eql(20000);
                    docs[2].userId.should.be.eql(config.testUser.userId);
                    docs[2].packageName.should.be.eql('com.android.com');
                    docs[2].totalUsedTime.should.be.eql(30000);
                    done();
                })
                .catch(err => done(err));
        });

        it('앱사용기록 저장시 다른 유저의 데이터는 수정하지 않는다', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send(data)
                .expect(200)
                .then(() => AppUsages.find({userId: 'anotherUserId'}).exec())
                .then(docs => {
                    docs.length.should.be.eql(1);
                    docs[0].userId.should.be.eql('anotherUserId');
                    docs[0].packageName.should.be.eql('com.pre.installed');
                    docs[0].totalUsedTime.should.be.eql(9999);
                    done();
                })
                .catch(err => done(err));
        });

        it('앱 사용기록을 잘못된 형태로 전송한 경우, 400 에러코드를 리턴한다.', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });

        it('빈 앱 사용기록을 전송한 경우, 아무 처리없이 200을 리턴한다.', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send([])
                .expect(200)
                .then(() => done())
                .catch(err => done(err));
        });

        afterEach(done => {
            AppUsages.remove({}, done);
        });
    });

    describe('GET /stats/usages/app/category/{categoryId}', () => {
        before(done => {
            AppUsages.create([{
                userId: 'anotherUserId',
                packageName: 'com.test.testt',
                totalUsedTime: 9992
            }, {
                userId: config.testUser.userId,
                packageName: 'com.nhn.android.nmap',
                totalUsedTime: 9999
            }, {
                userId: config.testUser.userId,
                packageName: 'com.kakao.talk',
                totalUsedTime: 40000
            }, {
                userId: config.testUser.userId,
                packageName: 'com.nhn.line',
                totalUsedTime: 20000
            }, {
                userId: config.testUser.userId,
                packageName: 'com.game.edu',
                totalUsedTime: 90000
            }, {
                userId: config.testUser.userId,
                packageName: 'com.game.rpg',
                totalUsedTime: 10000
            }, {
                // 특정 앱의 사용 데이터는 있지만 해당 앱 정보가 DB에 없는 경우, 해당 앱은 제외한다.
                userId: config.testUser.userId,
                packageName: 'com.game.empty',
                totalUsedTime: 10000
            }], function () {
                Apps.create([{
                    packageName: 'com.test.testt',
                    appName: '테스트앱',
                    categoryId1: 'TEST',
                    categoryName1: '테스트',
                    developer: 'Test Developer',
                    iconUrl: 'testIconUrl',
                }, {
                    packageName: 'com.nhn.android.nmap',
                    appName: '네이버지도',
                    categoryId1: 'TOOL',
                    categoryName1: '도구',
                    developer: 'NHN Corp.',
                    iconUrl: 'iconUrl0',
                }, {
                    packageName: 'com.kakao.talk',
                    appName: '카카오톡',
                    categoryId1: 'COMMUNICATION',
                    categoryName1: '커뮤니케이션',
                    developer: 'Kakao Coperation',
                    iconUrl: 'iconUrl1',
                }, {
                    packageName: 'com.nhn.line',
                    appName: '네이버 라인',
                    categoryId1: 'COMMUNICATION',
                    categoryName1: '커뮤니케이션',
                    developer: 'NHN Corp.',
                    iconUrl: 'iconUrl2',
                }, {
                    packageName: 'com.game.edu',
                    appName: '교육게임명',
                    categoryId1: 'GAME_EDUCATIONAL',
                    categoryName1: '교육',
                    developer: 'Edu Game Corp.',
                    iconUrl: 'iconUrl3',
                }, {
                    packageName: 'com.game.rpg',
                    appName: '롤플레잉게임명',
                    categoryId1: 'GAME_ROLE_PLAYING',
                    categoryName1: '롤플레잉',
                    developer: 'Rpg Game Corp.',
                    iconUrl: 'iconUrl4',
                }], function () {
                    done()
                });
            });
        });

        it('요청한 사용자의 데이터들만 리턴한다', done => {
            request.get('/stats/usages/app/category/TOOL')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);

                    res.body[0].userId.should.be.eql(config.testUser.userId);

                    done();
                }).catch(err => done(err));
        });

        it('지정한 카테고리의 앱 누적 사용 데이터들을 리턴한다', done => {
            request.get('/stats/usages/app/category/COMMUNICATION')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);

                    res.body[0].appInfo.packageName.should.be.eql('com.kakao.talk');
                    res.body[0].appInfo.appName.should.be.eql('카카오톡');
                    res.body[0].appInfo.categoryId1.should.be.eql('COMMUNICATION');
                    res.body[0].appInfo.categoryName1.should.be.eql('커뮤니케이션');
                    res.body[0].appInfo.developer.should.be.eql('Kakao Coperation');
                    res.body[0].appInfo.iconUrl.should.be.eql('iconUrl1');
                    res.body[0].totalUsedTime.should.be.eql(40000);

                    res.body[1].appInfo.packageName.should.be.eql('com.nhn.line');
                    res.body[1].appInfo.appName.should.be.eql('네이버 라인');
                    res.body[1].appInfo.categoryId1.should.be.eql('COMMUNICATION');
                    res.body[1].appInfo.categoryName1.should.be.eql('커뮤니케이션');
                    res.body[1].appInfo.developer.should.be.eql('NHN Corp.');
                    res.body[1].appInfo.iconUrl.should.be.eql('iconUrl2');
                    res.body[1].totalUsedTime.should.be.eql(20000);

                    done();
                }).catch(err => done(err));
        });

        it('지정한 대분류 카테고리들의 앱 누적 사용 데이터들을 리턴한다', done => {
            request.get('/stats/usages/app/category/GAME')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);

                    res.body[0].appInfo.packageName.should.be.eql('com.game.edu');
                    res.body[0].appInfo.appName.should.be.eql('교육게임명');
                    res.body[0].appInfo.categoryId1.should.be.eql('GAME_EDUCATIONAL');
                    res.body[0].appInfo.categoryName1.should.be.eql('교육');
                    res.body[0].appInfo.developer.should.be.eql('Edu Game Corp.');
                    res.body[0].appInfo.iconUrl.should.be.eql('iconUrl3');
                    res.body[0].totalUsedTime.should.be.eql(90000);

                    res.body[1].appInfo.packageName.should.be.eql('com.game.rpg');
                    res.body[1].appInfo.appName.should.be.eql('롤플레잉게임명');
                    res.body[1].appInfo.categoryId1.should.be.eql('GAME_ROLE_PLAYING');
                    res.body[1].appInfo.categoryName1.should.be.eql('롤플레잉');
                    res.body[1].appInfo.developer.should.be.eql('Rpg Game Corp.');
                    res.body[1].appInfo.iconUrl.should.be.eql('iconUrl4');
                    res.body[1].totalUsedTime.should.be.eql(10000);

                    done();
                }).catch(err => done(err));
        });

        after(done => {
            AppUsages.remove({}, () => {
                Apps.remove({}, done);
            });
        });
    });

    describe('GET /stats/usages/category', () => {
        beforeEach(done => {
            AppUsages.create([{
                userId: 'anotherUserId',
                packageName: 'com.test.testt',
                totalUsedTime: 9992
            }, {
                userId: config.testUser.userId,
                packageName: 'com.nhn.android.nmap',
                totalUsedTime: 9999
            }, {
                userId: config.testUser.userId,
                packageName: 'com.nhn.line',
                totalUsedTime: 20000
            }, {
                userId: config.testUser.userId,
                packageName: 'com.kakao.talk',
                totalUsedTime: 40000
            }, {
                // 특정 앱의 사용 데이터는 있지만 해당 앱 정보가 DB에 없는 경우, 해당 앱은 제외한다.
                userId: config.testUser.userId,
                packageName: 'com.game.empty',
                totalUsedTime: 10000
            }], function () {
                Apps.create([{
                    packageName: 'com.test.testt',
                    appName: '테스트앱',
                    categoryId1: 'TEST',
                    categoryName1: '테스트',
                    developer: 'Test Developer',
                    iconUrl: 'testIconUrl',
                }, {
                    packageName: 'com.nhn.android.nmap',
                    appName: '네이버지도',
                    categoryId1: 'TOOL',
                    categoryName1: '도구',
                    developer: 'NHN Corp.',
                    iconUrl: 'iconUrl0',
                }, {
                    packageName: 'com.kakao.talk',
                    appName: '카카오톡',
                    categoryId1: 'COMMUNICATION',
                    categoryName1: '커뮤니케이션',
                    developer: 'Kakao Coperation',
                    iconUrl: 'iconUrl1',
                }, {
                    packageName: 'com.nhn.line',
                    appName: '네이버 라인',
                    categoryId1: 'COMMUNICATION',
                    categoryName1: '커뮤니케이션',
                    developer: 'NHN Corp.',
                    iconUrl: 'iconUrl2',
                }], function () {
                    done()
                });
            });
        });

        it('카테고리별 앱 사용 시간을 합산하여 정렬된 리스트를 반환한다', done => {
            request.get('/stats/usages/category')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);

                    res.body[0].categoryId.should.be.eql('COMMUNICATION');
                    res.body[0].categoryName.should.be.eql('커뮤니케이션');
                    res.body[0].totalUsedTime.should.be.eql(60000);

                    res.body[1].categoryId.should.be.eql('TOOL');
                    res.body[1].categoryName.should.be.eql('도구');
                    res.body[1].totalUsedTime.should.be.eql(9999);
                    done();
                }).catch(err => done(err));
        });

        describe('대분류에 속하는 앱을 사용하는 유저가 호출한 경우', () => {
            before(done => {
                AppUsages.insertMany([{
                    userId: config.testUser.userId,
                    packageName: 'com.game.edu',
                    totalUsedTime: 90000
                }, {
                    userId: config.testUser.userId,
                    packageName: 'com.game.rpg',
                    totalUsedTime: 10000
                }], function () {
                    Apps.insertMany([{
                        packageName: 'com.game.edu',
                        appName: '교육게임명',
                        categoryId1: 'GAME_EDUCATIONAL',
                        categoryName1: '교육',
                        developer: 'Edu Game Corp.',
                        iconUrl: 'iconUrl3',
                    }, {
                        packageName: 'com.game.rpg',
                        appName: '롤플레잉게임명',
                        categoryId1: 'GAME_ROLE_PLAYING',
                        categoryName1: '롤플레잉',
                        developer: 'Rpg Game Corp.',
                        iconUrl: 'iconUrl4',
                    }], function () {
                        done()
                    });
                });
            });

            it('카테고리별 앱 사용 시간을 합산하여 정렬된 리스트를 반환한다', done => {
                request.get('/stats/usages/category')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(200)
                    .then(res => {
                        res.body.length.should.be.eql(3);

                        res.body[0].categoryId.should.be.eql('GAME');
                        res.body[0].categoryName.should.be.eql('게임');
                        res.body[0].totalUsedTime.should.be.eql(100000);

                        res.body[1].categoryId.should.be.eql('COMMUNICATION');
                        res.body[1].categoryName.should.be.eql('커뮤니케이션');
                        res.body[1].totalUsedTime.should.be.eql(60000);

                        res.body[2].categoryId.should.be.eql('TOOL');
                        res.body[2].categoryName.should.be.eql('도구');
                        res.body[2].totalUsedTime.should.be.eql(9999);
                        done();
                    }).catch(err => done(err));
            });
        });


        afterEach(done => {
            AppUsages.remove({}, () => {
                Apps.remove({}, done);
            });
        });
    });
});