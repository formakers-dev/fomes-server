const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const sinon = require('sinon');
const ShortTermStats = require('../models/shortTermStats');
const Users = require('../models/users').Users;
const UserConstants = require('../models/users').Constants;
const {AppUsages, Apps} = require('../models/appUsages');
const UncrawledApps = require('../models/uncrawledApps');
const helper = require('./commonTestHelper');

describe('Stats', () => {
    const sandbox = sinon.createSandbox();

    before(done => {
        helper.commonBefore()
            .then(() => done())
            .catch(err => done(err));
    });

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

        beforeEach(done => {
            Users.create({
                userId: config.testUser.userId,
                lastStatsUpdateTime: new Date("2018-01-01T00:00:00.000Z"),
            }, done);
        });

        describe('단기통계데이터를 성공적으로 저장하면', () => {
            before(done => {
                sandbox.useFakeTimers(new Date("2018-05-02T13:30:00.000Z").getTime());
                done();
            });

            it('200을 리턴하고 데이터가 통계 정보 업데이트 시간과 함께 저장된다', (done) => {
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
                    }).catch((err) => done(err));
            });

            it('해당 유저 정보에 마지막 통계 정보 업데이트 시간이 기록된다.', (done) => {
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

            after(done => {
                sandbox.restore();
                done();
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

        it('단기통계데이터를 잘못된 형태로 전송한 경우, 412 에러코드를 리턴한다.', done => {
            request.post('/stats/short')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(412)
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

        afterEach((done) => {
            Users.remove({}, () =>
                ShortTermStats.remove({}, () => done())
            );
        });
    });

    describe('POST /stats/usages/app', () => {
        beforeEach(done => {
            sandbox.useFakeTimers(new Date("2018-09-26T15:30:00.000Z").getTime());

            AppUsages.create([{
                date: new Date("2018-09-24T15:00:00.000Z"),
                userId: 'anotherUserId',
                gender: 'female',
                birthday: 1952,
                job: 2,
                packageName: 'com.pre.installed',
                categoryId: 'TOOL',
                categoryName: '도구',
                appName: '설치된앱',
                iconUrl: 'iconUrlForInstalled',
                developer: '도구개발사',
                totalUsedTime: 9999,
            }, {
                date: new Date("2018-09-23T15:00:00.000Z"),
                userId: config.testUser.userId,
                gender: 'male',
                birthday: 1992,
                job: 1,
                packageName: 'com.kakao.talk',
                categoryId: 'GAME_COMMUNICATION',
                categoryName: '게임커뮤니케이션',
                appName: '카카오앱',
                iconUrl: 'iconUrlForKakao',
                developer: '카카오톡개발사',
                totalUsedTime: 40000,
            }, {
                date: new Date("2018-09-22T15:00:00.000Z"),
                userId: config.testUser.userId,
                gender: 'male',
                birthday: 1992,
                job: 1,
                packageName: 'com.dummy.app',
                categoryId: 'TOOLS',
                categoryName: '도구',
                appName: '더미앱',
                iconUrl: 'iconUrlForDummy',
                developer: '도구개발사',
                totalUsedTime: 10000,
            }])
                .then(() => Apps.create([{
                    packageName: 'com.android.com',
                    appName: '안드로이드앱',
                    categoryId1: 'GAME_TOOLS',
                    categoryName1: '게임도구',
                    developer: '구글개발사',
                    iconUrl: 'iconUrlForAndroid',
                }, {
                    packageName: 'com.kakao.talk',
                    appName: '카카오톡앱',
                    categoryId1: 'GAME_COMMUNICATION',
                    categoryName1: '게임커뮤니케이션',
                    developer: '카카오톡개발사',
                    iconUrl: 'iconUrlForKakao',
                }, {
                    packageName: 'com.naver.talk',
                    appName: '라인앱',
                    categoryId1: 'GAME_COMMUNICATION',
                    categoryName1: '게임커뮤니케이션',
                    developer: '라인개발사',
                    iconUrl: 'iconUrlForNaver',
                }, {
                    packageName: 'com.notgame.com',
                    appName: '게임아님앱',
                    categoryId1: 'COMMUNICATION',
                    categoryName1: '커뮤니케이션',
                    developer: '게임사아님사',
                    iconUrl: 'iconUrlForNotGame',
                }]))
                .then(() => Users.create(config.testUser))
                .then(() => done())
                .catch(err => done(err));
        });

        const data = [{
            date: new Date("2018-09-24T15:00:00.000Z"),
            packageName: 'com.kakao.talk',
            totalUsedTime: 20000,
            appVersion: '0.0.1',
        }, {
            date: new Date("2018-09-25T15:00:00.000Z"),
            packageName: 'com.kakao.talk',
            totalUsedTime: 10000,
            appVersion: '0.0.1',
        }, {
            date: new Date("2018-09-24T15:00:00.000Z"),
            packageName: 'com.naver.talk',
            totalUsedTime: 20000,
            appVersion: '0.0.2',
        }, {
            date: new Date("2018-09-24T15:00:00.000Z"),
            packageName: 'com.android.com',
            totalUsedTime: 30000,
            appVersion: '0.0.3',
        }, {
            date: new Date("2018-09-24T15:00:00.000Z"),
            packageName: 'com.notgame.com',
            totalUsedTime: 30000,
            appVersion: '0.0.4',
        }, {
            date: new Date("2018-09-24T15:00:00.000Z"),
            packageName: 'com.unknown.game',
            totalUsedTime: 12000,
            appVersion: '0.0.5',
        }];

        it('앱 사용 기록을 갱신한다', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send(data)
                .expect(200)
                .then(() => AppUsages.find({userId: config.testUser.userId}).exec())
                .then(docs => {
                    docs.length.should.be.eql(4);
                    docs = docs.sort((a,b) => (a.packageName > b.packageName) ? 1 : -1);

                    console.log(docs);
                    docs[0].date.should.be.eql(new Date('2018-09-24T15:00:00.000Z'));
                    docs[0].userId.should.be.eql(config.testUser.userId);
                    docs[0].gender.should.be.eql('male');
                    docs[0].birthday.should.be.eql(1992);
                    docs[0].job.should.be.eql(1);
                    docs[0].packageName.should.be.eql('com.android.com');
                    docs[0].appName.should.be.eql('안드로이드앱');
                    docs[0].categoryId.should.be.eql('GAME_TOOLS');
                    docs[0].categoryName.should.be.eql('게임도구');
                    docs[0].iconUrl.should.be.eql('iconUrlForAndroid');
                    docs[0].developer.should.be.eql('구글개발사');
                    docs[0].totalUsedTime.should.be.eql(30000);
                    docs[0].metaData.updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));
                    docs[0].metaData.appVersion.should.be.eql('0.0.3');
                    docs[0].metaData.fomesAppVersion.should.be.eql('9.9.99');

                    docs[1].date.should.be.eql(new Date('2018-09-24T15:00:00.000Z'));
                    docs[1].userId.should.be.eql(config.testUser.userId);
                    docs[1].gender.should.be.eql('male');
                    docs[1].birthday.should.be.eql(1992);
                    docs[1].job.should.be.eql(1);
                    docs[1].packageName.should.be.eql('com.kakao.talk');
                    docs[1].appName.should.be.eql('카카오톡앱');
                    docs[1].categoryId.should.be.eql('GAME_COMMUNICATION');
                    docs[1].categoryName.should.be.eql('게임커뮤니케이션');
                    docs[1].iconUrl.should.be.eql('iconUrlForKakao');
                    docs[1].developer.should.be.eql('카카오톡개발사');
                    docs[1].totalUsedTime.should.be.eql(20000);
                    docs[1].metaData.updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));
                    docs[1].metaData.appVersion.should.be.eql('0.0.1');
                    docs[1].metaData.fomesAppVersion.should.be.eql('9.9.99');

                    docs[2].date.should.be.eql(new Date('2018-09-25T15:00:00.000Z'));
                    docs[2].userId.should.be.eql(config.testUser.userId);
                    docs[2].gender.should.be.eql('male');
                    docs[2].birthday.should.be.eql(1992);
                    docs[2].job.should.be.eql(1);
                    docs[2].packageName.should.be.eql('com.kakao.talk');
                    docs[2].appName.should.be.eql('카카오톡앱');
                    docs[2].categoryId.should.be.eql('GAME_COMMUNICATION');
                    docs[2].categoryName.should.be.eql('게임커뮤니케이션');
                    docs[2].iconUrl.should.be.eql('iconUrlForKakao');
                    docs[2].developer.should.be.eql('카카오톡개발사');
                    docs[2].totalUsedTime.should.be.eql(10000);
                    docs[2].metaData.updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));
                    docs[2].metaData.appVersion.should.be.eql('0.0.1');
                    docs[2].metaData.fomesAppVersion.should.be.eql('9.9.99');

                    docs[3].date.should.be.eql(new Date('2018-09-24T15:00:00.000Z'));
                    docs[3].userId.should.be.eql(config.testUser.userId);
                    docs[3].gender.should.be.eql('male');
                    docs[3].birthday.should.be.eql(1992);
                    docs[3].job.should.be.eql(1);
                    docs[3].packageName.should.be.eql('com.naver.talk');
                    docs[3].appName.should.be.eql('라인앱');
                    docs[3].categoryId.should.be.eql('GAME_COMMUNICATION');
                    docs[3].categoryName.should.be.eql('게임커뮤니케이션');
                    docs[3].iconUrl.should.be.eql('iconUrlForNaver');
                    docs[3].developer.should.be.eql('라인개발사');
                    docs[3].totalUsedTime.should.be.eql(20000);
                    docs[3].metaData.updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));
                    docs[3].metaData.appVersion.should.be.eql('0.0.2');
                    docs[3].metaData.fomesAppVersion.should.be.eql('9.9.99');

                    done();
                })
                .catch(err => done(err));
        });

        it('날짜가 없는 데이터는 현재 날짜로 채워넣는다', () => {
            const undatedData = [{
                packageName: 'com.kakao.talk',
                totalUsedTime: 20000,
            }, {
                packageName: 'com.naver.talk',
                totalUsedTime: 20000,
            }, {
                packageName: 'com.android.com',
                totalUsedTime: 30000,
            }, {
                packageName: 'com.notgame.com',
                totalUsedTime: 30000,
            }, {
                packageName: 'com.unknown.game',
                totalUsedTime: 12000,
            }];

            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send(undatedData)
                .expect(200)
                .then(() => AppUsages.find({userId: config.testUser.userId}).exec())
                .then(docs => {
                    docs.length.should.be.eql(3);
                    docs = docs.sort((a,b) => (a.packageName > b.packageName) ? 1 : -1);

                    docs[0].date.should.be.eql(new Date('2018-09-26T15:00:00.000Z'));
                    docs[0].userId.should.be.eql(config.testUser.userId);
                    docs[0].gender.should.be.eql('male');
                    docs[0].birthday.should.be.eql(1992);
                    docs[0].job.should.be.eql(1);
                    docs[0].appVersion.should.be.eql('9.9.99');
                    docs[0].packageName.should.be.eql('com.android.com');
                    docs[0].appName.should.be.eql('안드로이드앱');
                    docs[0].categoryId.should.be.eql('GAME_TOOLS');
                    docs[0].categoryName.should.be.eql('게임도구');
                    docs[0].iconUrl.should.be.eql('iconUrlForAndroid');
                    docs[0].developer.should.be.eql('구글개발사');
                    docs[0].totalUsedTime.should.be.eql(30000);
                    docs[0].updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));


                    docs[1].date.should.be.eql(new Date('2018-09-26T15:00:00.000Z'));
                    docs[1].userId.should.be.eql(config.testUser.userId);
                    docs[1].gender.should.be.eql('male');
                    docs[1].birthday.should.be.eql(1992);
                    docs[1].job.should.be.eql(1);
                    docs[1].appVersion.should.be.eql('9.9.99');
                    docs[1].packageName.should.be.eql('com.kakao.talk');
                    docs[1].appName.should.be.eql('카카오톡앱');
                    docs[1].categoryId.should.be.eql('GAME_COMMUNICATION');
                    docs[1].categoryName.should.be.eql('게임커뮤니케이션');
                    docs[1].iconUrl.should.be.eql('iconUrlForKakao');
                    docs[1].developer.should.be.eql('카카오톡개발사');
                    docs[1].totalUsedTime.should.be.eql(20000);
                    docs[1].updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));

                    docs[2].date.should.be.eql(new Date('2018-09-26T15:00:00.000Z'));
                    docs[2].userId.should.be.eql(config.testUser.userId);
                    docs[2].gender.should.be.eql('male');
                    docs[2].birthday.should.be.eql(1992);
                    docs[2].job.should.be.eql(1);
                    docs[2].appVersion.should.be.eql('9.9.99');
                    docs[2].packageName.should.be.eql('com.naver.talk');
                    docs[2].appName.should.be.eql('라인앱');
                    docs[2].categoryId.should.be.eql('GAME_COMMUNICATION');
                    docs[2].categoryName.should.be.eql('게임커뮤니케이션');
                    docs[2].iconUrl.should.be.eql('iconUrlForNaver');
                    docs[2].developer.should.be.eql('라인개발사');
                    docs[2].totalUsedTime.should.be.eql(20000);
                    docs[2].updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));

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
                    docs[0].gender.should.be.eql('female');
                    docs[0].birthday.should.be.eql(1952);
                    docs[0].job.should.be.eql(2);
                    docs[0].packageName.should.be.eql('com.pre.installed');
                    docs[0].totalUsedTime.should.be.eql(9999);
                    done();
                })
                .catch(err => done(err));
        });

        it('앱 사용기록 저장 시 게임으로 확인되지 않는 경우, UncrawledApps에 저장한다.', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send(data)
                .expect(200)
                .then(() => UncrawledApps.find({}).exec())
                .then(docs => {
                    docs.length.should.be.eql(2);
                    docs[0].packageName.should.be.eql('com.notgame.com');
                    docs[1].packageName.should.be.eql('com.unknown.game');
                    done();
                })
                .catch(err => done(err));
        });

        it('앱 사용기록을 잘못된 형태로 전송한 경우, 412 에러코드를 리턴한다.', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(412)
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
            sandbox.restore();

            AppUsages.remove({})
                .then(() => Users.remove({}))
                .then(() => Apps.remove({}))
                .then(() => UncrawledApps.remove({}))
                .then(() => done())
                .catch(err => done(err));
        });
    });

    // 분석화면
    describe('POST /stats/report/category/:categoryId/recent', () => {
        const dummy = require('./dummy').stats;

        describe('랭킹', () => {
            beforeEach(done => {
                sandbox.useFakeTimers(new Date("2019-04-19T00:00:00.000Z").getTime());
                Users.create(dummy.users)
                    .then(() => AppUsages.create(dummy.appUsages))
                    .then(() => Apps.create(dummy.apps))
                    .then(() => done())
                    .catch(err => done(err));
                }
            );

            describe('정상 케이스', () => {
                it('유저와 1등, 꼴등의 랭크 데이터를 반환한다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.totalUsedTimeRank.length.should.be.eql(3);

                            res.body.totalUsedTimeRank.sort((a, b) => a.rank > b.rank ? 1 : -1);

                            res.body.totalUsedTimeRank[0].userId.should.be.eql("peopleId3");
                            res.body.totalUsedTimeRank[0].rank.should.be.eql(1);
                            res.body.totalUsedTimeRank[0].content.should.be.eql(50000);

                            res.body.totalUsedTimeRank[1].userId.should.be.eql(config.testUser.userId);
                            res.body.totalUsedTimeRank[1].rank.should.be.eql(2);
                            res.body.totalUsedTimeRank[1].content.should.be.eql(19000);

                            res.body.totalUsedTimeRank[2].userId.should.be.eql("peopleId1");
                            res.body.totalUsedTimeRank[2].rank.should.be.eql(4);
                            res.body.totalUsedTimeRank[2].content.should.be.eql(4000);

                            res.body.totalUserCount.should.be.eql(4);

                            done();
                        }).catch(err => done(err));
                });
            });

            describe('나의 랭킹 정보가 없으면', () => {
                beforeEach(done => {
                    AppUsages.remove({userId : config.testUser.userId}).then(() => done());
                });

                it('나의 랭킹 정보를 제외하고 반환한다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then(res => {
                            res.body.totalUsedTimeRank.length.should.be.eql(2);

                            res.body.totalUsedTimeRank[0].userId.should.be.eql("peopleId3");
                            res.body.totalUsedTimeRank[0].rank.should.be.eql(1);
                            res.body.totalUsedTimeRank[0].content.should.be.eql(50000);
                            res.body.totalUsedTimeRank[1].userId.should.be.eql("peopleId1");
                            res.body.totalUsedTimeRank[1].rank.should.be.eql(3);
                            res.body.totalUsedTimeRank[1].content.should.be.eql(4000);

                            res.body.totalUserCount.should.be.eql(3);

                            done();
                        }).catch(err => done(err))
                });
            });

            afterEach(done => {
                sandbox.restore();
                Users.remove({}, () => {
                    AppUsages.remove({}, () => {
                        Apps.remove({}, done);
                    });
                });
            });
        });

        describe('특정 카테고리의 앱 사용 누적시간 데이터가 반환된다', () => {
            before(done => {
                sandbox.useFakeTimers(new Date("2019-04-19T00:00:00.000Z").getTime());
                Users.create(dummy.users)
                    .then(() => AppUsages.create(dummy.appUsages))
                    .then(() => done())
                    .catch(err => done(err));
            });

            it('3 가지 그룹의 데이터가 반환된다', done => {
                request.post('/stats/report/category/GAME/recent')
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(config.testUser)
                    .expect(200)
                    .then((res) => {
                        res.body.usages.length.should.be.eql(3);

                        res.body.usages.sort((a, b) => a.groupTypeType > b.groupTypeType ? 1 : -1);

                        res.body.usages[0].groupType.should.be.eql(UserConstants.mine);
                        res.body.usages[1].groupType.should.be.eql(UserConstants.gender | UserConstants.age);
                        res.body.usages[2].groupType.should.be.eql(UserConstants.job);
                        done();
                    }).catch(err => done(err));
            });

            describe('나의 데이터', () => {

                it('요청한 유저의 앱 사용 데이터를 반환한다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const userAppUsage = res.body.usages[0].appUsages;

                            userAppUsage.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                            userAppUsage.length.should.be.eql(2);

                            userAppUsage[0].id.should.be.eql('com.game.rpg');
                            userAppUsage[0].name.should.be.eql('롤플레잉게임명');
                            userAppUsage[0].totalUsedTime.should.be.eql(10000);
                            userAppUsage[0].appInfos.length.should.be.eql(1);
                            userAppUsage[0].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            userAppUsage[0].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            userAppUsage[0].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            userAppUsage[0].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            userAppUsage[0].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            userAppUsage[0].appInfos[0].iconUrl.should.be.eql('iconUrl4');

                            userAppUsage[1].id.should.be.eql('com.game.edu2');
                            userAppUsage[1].name.should.be.eql('교육게임명2');
                            userAppUsage[1].totalUsedTime.should.be.eql(9000);
                            userAppUsage[1].appInfos.length.should.be.eql(1);
                            userAppUsage[1].appInfos[0].packageName.should.be.eql('com.game.edu2');
                            userAppUsage[1].appInfos[0].appName.should.be.eql('교육게임명2');
                            userAppUsage[1].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            userAppUsage[1].appInfos[0].categoryName.should.be.eql('교육');
                            userAppUsage[1].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            userAppUsage[1].appInfos[0].iconUrl.should.be.eql('iconUrl32');

                            done();
                        }).catch(err => done(err));
                });

                it('요청한 유저의 카테고리 사용 데이터를 반환한다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const userCategoryUsages = res.body.usages[0].categoryUsages;

                            userCategoryUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

                            userCategoryUsages.length.should.be.eql(2);

                            userCategoryUsages[0].id.should.be.eql('GAME_ROLE_PLAYING');
                            userCategoryUsages[0].name.should.be.eql('롤플레잉');
                            userCategoryUsages[0].totalUsedTime.should.be.eql(10000);
                            should.not.exist(userCategoryUsages[1].appInfos);

                            userCategoryUsages[1].id.should.be.eql('GAME_EDUCATIONAL');
                            userCategoryUsages[1].name.should.be.eql('교육');
                            userCategoryUsages[1].totalUsedTime.should.be.eql(9000);
                            should.not.exist(userCategoryUsages[0].appInfos);

                            done();
                        }).catch(err => done(err));
                });

                it('요청한 유저의 개발사별 사용 데이터를 반환한다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const userDeveloperUsages = res.body.usages[0].developerUsages;

                            userDeveloperUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                            userDeveloperUsages.forEach(usages => {
                                usages.appInfos.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                            });

                            userDeveloperUsages.length.should.be.eql(1);

                            userDeveloperUsages[0].id.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[0].name.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[0].totalUsedTime.should.be.eql(19000);

                            userDeveloperUsages[0].appInfos.length.should.be.eql(2);

                            userDeveloperUsages[0].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            userDeveloperUsages[0].appInfos[0].totalUsedTime.should.be.eql(10000);
                            userDeveloperUsages[0].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            userDeveloperUsages[0].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            userDeveloperUsages[0].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            userDeveloperUsages[0].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[0].appInfos[0].iconUrl.should.be.eql('iconUrl4');

                            userDeveloperUsages[0].appInfos[1].packageName.should.be.eql('com.game.edu2');
                            userDeveloperUsages[0].appInfos[1].totalUsedTime.should.be.eql(9000);
                            userDeveloperUsages[0].appInfos[1].appName.should.be.eql('교육게임명2');
                            userDeveloperUsages[0].appInfos[1].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            userDeveloperUsages[0].appInfos[1].categoryName.should.be.eql('교육');
                            userDeveloperUsages[0].appInfos[1].developer.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[0].appInfos[1].iconUrl.should.be.eql('iconUrl32');

                            done();
                        }).catch(err => done(err));
                });
            });

            describe('성별+나이 그룹 데이터', () => {

                it('사람들의 앱 누적 사용 데이터를 가져온다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const genderAgeAppUsages = res.body.usages[1].appUsages;

                            genderAgeAppUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

                            // gender + age
                            // people 3
                            genderAgeAppUsages.length.should.be.eql(3);

                            genderAgeAppUsages[0].id.should.be.eql('com.game.puzzle');
                            genderAgeAppUsages[0].name.should.be.eql('퍼즐게임명');
                            genderAgeAppUsages[0].totalUsedTime.should.be.eql(50000);
                            genderAgeAppUsages[0].appInfos.length.should.be.eql(1);
                            genderAgeAppUsages[0].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            genderAgeAppUsages[0].appInfos[0].appName.should.be.eql('퍼즐게임명');
                            genderAgeAppUsages[0].appInfos[0].categoryId.should.be.eql('GAME_PUZZLE');
                            genderAgeAppUsages[0].appInfos[0].categoryName.should.be.eql('퍼즐');
                            genderAgeAppUsages[0].appInfos[0].developer.should.be.eql('Puzzle Game Corp.');
                            genderAgeAppUsages[0].appInfos[0].iconUrl.should.be.eql('iconUrl6');

                            genderAgeAppUsages[1].id.should.be.eql('com.game.rpg');
                            genderAgeAppUsages[1].name.should.be.eql('롤플레잉게임명');
                            genderAgeAppUsages[1].totalUsedTime.should.be.eql(10000);
                            genderAgeAppUsages[1].appInfos.length.should.be.eql(1);
                            genderAgeAppUsages[1].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            genderAgeAppUsages[1].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            genderAgeAppUsages[1].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            genderAgeAppUsages[1].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            genderAgeAppUsages[1].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            genderAgeAppUsages[1].appInfos[0].iconUrl.should.be.eql('iconUrl4');

                            genderAgeAppUsages[2].id.should.be.eql('com.game.edu2');
                            genderAgeAppUsages[2].name.should.be.eql('교육게임명2');
                            genderAgeAppUsages[2].totalUsedTime.should.be.eql(9000);
                            genderAgeAppUsages[2].appInfos.length.should.be.eql(1);
                            genderAgeAppUsages[2].appInfos[0].packageName.should.be.eql('com.game.edu2');
                            genderAgeAppUsages[2].appInfos[0].appName.should.be.eql('교육게임명2');
                            genderAgeAppUsages[2].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            genderAgeAppUsages[2].appInfos[0].categoryName.should.be.eql('교육');
                            genderAgeAppUsages[2].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            genderAgeAppUsages[2].appInfos[0].iconUrl.should.be.eql('iconUrl32');

                            done();

                        }).catch(err => done(err))
                });

                it('사람들의 카테고리 사용 데이터를 가져온다', done => {

                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const genderAgeCategoryUsages = res.body.usages[1].categoryUsages;

                            genderAgeCategoryUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

                            // gender + age
                            // people 3
                            genderAgeCategoryUsages.length.should.be.eql(3);

                            genderAgeCategoryUsages[0].id.should.be.eql('GAME_PUZZLE');
                            genderAgeCategoryUsages[0].name.should.be.eql('퍼즐');
                            genderAgeCategoryUsages[0].totalUsedTime.should.be.eql(50000);
                            should.not.exist(genderAgeCategoryUsages[0].appInfos);

                            genderAgeCategoryUsages[1].id.should.be.eql('GAME_ROLE_PLAYING');
                            genderAgeCategoryUsages[1].name.should.be.eql('롤플레잉');
                            genderAgeCategoryUsages[1].totalUsedTime.should.be.eql(10000);
                            should.not.exist(genderAgeCategoryUsages[1].appInfos);

                            genderAgeCategoryUsages[2].id.should.be.eql('GAME_EDUCATIONAL');
                            genderAgeCategoryUsages[2].name.should.be.eql('교육');
                            genderAgeCategoryUsages[2].totalUsedTime.should.be.eql(9000);
                            should.not.exist(genderAgeCategoryUsages[2].appInfos);

                            done();

                        }).catch(err => done(err))
                });

                it('사람들의 개발사별 사용 데이터를 가져온다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const genderAgeDeveloperUsages = res.body.usages[1].developerUsages;

                            genderAgeDeveloperUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                            genderAgeDeveloperUsages.forEach(usages => {
                                usages.appInfos.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                            });

                            genderAgeDeveloperUsages.length.should.be.eql(2);

                            genderAgeDeveloperUsages[0].id.should.be.eql('Puzzle Game Corp.');
                            genderAgeDeveloperUsages[0].name.should.be.eql('Puzzle Game Corp.');
                            genderAgeDeveloperUsages[0].totalUsedTime.should.be.eql(50000);
                            genderAgeDeveloperUsages[0].appInfos.length.should.be.eql(1);
                            genderAgeDeveloperUsages[0].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            genderAgeDeveloperUsages[0].appInfos[0].totalUsedTime.should.be.eql(50000);

                            genderAgeDeveloperUsages[1].id.should.be.eql('GameDuckHu Corp.');
                            genderAgeDeveloperUsages[1].name.should.be.eql('GameDuckHu Corp.');
                            genderAgeDeveloperUsages[1].totalUsedTime.should.be.eql(19000);
                            genderAgeDeveloperUsages[1].appInfos.length.should.be.eql(2);
                            genderAgeDeveloperUsages[1].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            genderAgeDeveloperUsages[1].appInfos[0].totalUsedTime.should.be.eql(10000);
                            genderAgeDeveloperUsages[1].appInfos[1].packageName.should.be.eql('com.game.edu2');
                            genderAgeDeveloperUsages[1].appInfos[1].totalUsedTime.should.be.eql(9000);

                            done();
                        }).catch(err => done(err));
                });
            });

            describe('직업 그룹 데이터', () => {

                it('사람들의 앱 누적 사용 데이터를 가져온다', done => {

                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const jobAppUsages = res.body.usages[2].appUsages;

                            jobAppUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

                            // job
                            // people 1, 2
                            jobAppUsages.length.should.be.eql(3);

                            jobAppUsages[0].id.should.be.eql('com.game.rpg');
                            jobAppUsages[0].name.should.be.eql('롤플레잉게임명');
                            jobAppUsages[0].totalUsedTime.should.be.eql(14000);
                            jobAppUsages[0].appInfos.length.should.be.eql(1);
                            jobAppUsages[0].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            jobAppUsages[0].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            jobAppUsages[0].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            jobAppUsages[0].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            jobAppUsages[0].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            jobAppUsages[0].appInfos[0].iconUrl.should.be.eql('iconUrl4');

                            jobAppUsages[1].id.should.be.eql('com.game.puzzle');
                            jobAppUsages[1].name.should.be.eql('퍼즐게임명');
                            jobAppUsages[1].totalUsedTime.should.be.eql(10000);
                            jobAppUsages[1].appInfos.length.should.be.eql(1);
                            jobAppUsages[1].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            jobAppUsages[1].appInfos[0].appName.should.be.eql('퍼즐게임명');
                            jobAppUsages[1].appInfos[0].categoryId.should.be.eql('GAME_PUZZLE');
                            jobAppUsages[1].appInfos[0].categoryName.should.be.eql('퍼즐');
                            jobAppUsages[1].appInfos[0].developer.should.be.eql('Puzzle Game Corp.');
                            jobAppUsages[1].appInfos[0].iconUrl.should.be.eql('iconUrl6');

                            jobAppUsages[2].id.should.be.eql('com.game.edu2');
                            jobAppUsages[2].name.should.be.eql('교육게임명2');
                            jobAppUsages[2].totalUsedTime.should.be.eql(9000);
                            jobAppUsages[2].appInfos.length.should.be.eql(1);
                            jobAppUsages[2].appInfos[0].packageName.should.be.eql('com.game.edu2');
                            jobAppUsages[2].appInfos[0].appName.should.be.eql('교육게임명2');
                            jobAppUsages[2].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            jobAppUsages[2].appInfos[0].categoryName.should.be.eql('교육');
                            jobAppUsages[2].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            jobAppUsages[2].appInfos[0].iconUrl.should.be.eql('iconUrl32');

                            done();

                        }).catch(err => done(err))
                });

                it('사람들의 카테고리 사용 데이터를 가져온다', done => {

                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const jobCategoryUsages = res.body.usages[2].categoryUsages;

                            jobCategoryUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);

                            // job
                            // people 1, 2
                            jobCategoryUsages.length.should.be.eql(3);

                            jobCategoryUsages[0].id.should.be.eql('GAME_ROLE_PLAYING');
                            jobCategoryUsages[0].name.should.be.eql('롤플레잉');
                            jobCategoryUsages[0].totalUsedTime.should.be.eql(14000);
                            should.not.exist(jobCategoryUsages[0].appInfos);

                            jobCategoryUsages[1].id.should.be.eql('GAME_PUZZLE');
                            jobCategoryUsages[1].name.should.be.eql('퍼즐');
                            jobCategoryUsages[1].totalUsedTime.should.be.eql(10000);
                            should.not.exist(jobCategoryUsages[2].appInfos);

                            jobCategoryUsages[2].id.should.be.eql('GAME_EDUCATIONAL');
                            jobCategoryUsages[2].name.should.be.eql('교육');
                            jobCategoryUsages[2].totalUsedTime.should.be.eql(9000);
                            should.not.exist(jobCategoryUsages[1].appInfos);

                            done();

                        }).catch(err => done(err))
                });

                it('사람들의 개발사별 사용 데이터를 가져온다', done => {
                    request.post('/stats/report/category/GAME/recent')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(config.testUser)
                        .expect(200)
                        .then((res) => {
                            res.body.usages.sort((a, b) => a.groupType > b.groupType ? 1 : -1);
                            const jobDeveloperUsages = res.body.usages[2].developerUsages;

                            jobDeveloperUsages.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                            jobDeveloperUsages.forEach(usages => {
                                usages.appInfos.sort((a, b) => a.totalUsedTime > b.totalUsedTime ? -1 : 1);
                            });

                            jobDeveloperUsages.length.should.be.eql(2);

                            jobDeveloperUsages[0].id.should.be.eql('GameDuckHu Corp.');
                            jobDeveloperUsages[0].name.should.be.eql('GameDuckHu Corp.');
                            jobDeveloperUsages[0].totalUsedTime.should.be.eql(23000);
                            jobDeveloperUsages[0].appInfos.length.should.be.eql(2);
                            jobDeveloperUsages[0].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            jobDeveloperUsages[0].appInfos[0].totalUsedTime.should.be.eql(14000);
                            jobDeveloperUsages[0].appInfos[1].packageName.should.be.eql('com.game.edu2');
                            jobDeveloperUsages[0].appInfos[1].totalUsedTime.should.be.eql(9000);

                            jobDeveloperUsages[1].id.should.be.eql('Puzzle Game Corp.');
                            jobDeveloperUsages[1].name.should.be.eql('Puzzle Game Corp.');
                            jobDeveloperUsages[1].totalUsedTime.should.be.eql(10000);
                            jobDeveloperUsages[1].appInfos.length.should.be.eql(1);
                            jobDeveloperUsages[1].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            jobDeveloperUsages[1].appInfos[0].totalUsedTime.should.be.eql(10000);

                            done();
                        }).catch(err => done(err));
                });
            });

            after(done => {
                sandbox.restore();
                Users.remove({}, () => {
                    AppUsages.remove({}, () => {
                        Apps.remove({}, done);
                    });
                });
            });
        });


    });

    after(done => {
        helper.commonAfter()
            .then(() => done())
            .catch(err => done(err));
    })
});
