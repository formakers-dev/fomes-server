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
const helper = require('./commonTestHelper');

describe('Stats', () => {
    const sandbox = sinon.sandbox.create();

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
        let clock;

        beforeEach(done => {
            AppUsages.create([{
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
                totalUsedTime: 9999
            }, {
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
                totalUsedTime: 40000
            }, {
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
                totalUsedTime: 10000
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
                .then(() => {
                    clock = sandbox.useFakeTimers(new Date("2018-09-26T15:30:00.000Z").getTime());
                    done();
                }).catch(err => done(err));
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
        }, {
            packageName: 'com.notgame.com',
            totalUsedTime: 30000,
        }];

        it('앱 사용 기록을 갱신한다', done => {
            request.post('/stats/usages/app')
                .set('x-access-token', config.appbeeToken.valid)
                .send(data)
                .expect(200)
                .then(() => AppUsages.find({userId: config.testUser.userId}).exec())
                .then(docs => {
                    docs.length.should.be.eql(3);

                    docs = docs.sort((a,b) => (a.packageName > b.packageName) ? 1 : -1);

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
                    docs[0].updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));

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
                    docs[1].totalUsedTime.should.be.eql(10000);
                    docs[1].updateTime.should.be.eql(new Date('2018-09-26T15:30:00.000Z'));

                    docs[2].userId.should.be.eql(config.testUser.userId);
                    docs[2].gender.should.be.eql('male');
                    docs[2].birthday.should.be.eql(1992);
                    docs[2].job.should.be.eql(1);
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
            clock.restore();
            AppUsages.remove({})
                .then(() => Users.remove({}))
                .then(() => Apps.remove({}))
                .then(() => done())
                .catch(err => done(err));
        });
    });

    describe('POST /stats/report/category/:categoryId/recent', () => {
        describe('랭킹', () => {
            beforeEach(done => {
                    Users.create([
                        config.testUser,
                        {
                            userId: 'peopleId1',
                            birthday: 1943,
                            job: 1,
                            gender: 'male',
                        },
                        {
                            userId: 'peopleId2',
                            birthday: 1989,
                            job: 1,
                            gender: 'female',
                        },
                        {
                            userId: 'peopleId3',
                            birthday: 1990,
                            job: 2,
                            gender: 'male',
                        },
                        {
                            userId: 'uninstalledOldPeople',
                            birthday: 1970,
                            job: 1,
                            gender: 'male',
                        }])
                        .then(() => AppUsages.create([
                            ////////// start of me ///////////////
                            {
                                userId: config.testUser.userId,
                                packageName: 'com.nhn.android.nmap',
                                totalUsedTime: 9999,
                                appName: '네이버지도',
                                categoryId: 'TOOL',
                                categoryName: '도구',
                                developer: 'NHN Corp.',
                                iconUrl: 'iconUrl0',
                                gender: 'male',
                                birthday: 1992,
                                job: 1,
                            }, {
                                // 특정 앱의 사용 데이터는 있지만 해당 앱 정보가 DB에 없는 경우, 해당 앱은 제외한다.
                                userId: config.testUser.userId,
                                packageName: 'com.game.empty',
                                totalUsedTime: 10000,
                                gender: 'male',
                                birthday: 1992,
                                job: 1,
                            }, {
                                userId: config.testUser.userId,
                                packageName: 'com.game.edu',
                                totalUsedTime: 90000,
                                appName: '교육게임명',
                                categoryId: 'GAME_EDUCATIONAL',
                                categoryName: '교육',
                                developer: 'Edu Game Corp.',
                                iconUrl: 'iconUrl3',
                                gender: 'male',
                                birthday: 1992,
                                job: 1,
                            }, {
                                userId: config.testUser.userId,
                                packageName: 'com.game.rpg',
                                totalUsedTime: 10000,
                                appName: '롤플레잉게임명',
                                categoryId: 'GAME_ROLE_PLAYING',
                                categoryName: '롤플레잉',
                                developer: 'GameDuckHu Corp.',
                                iconUrl: 'iconUrl4',
                                gender: 'male',
                                birthday: 1992,
                                job: 1,
                            }, {
                                userId: config.testUser.userId,
                                packageName: 'com.game.edu2',
                                totalUsedTime: 5000,
                                appName: '교육게임명2',
                                categoryId: 'GAME_EDUCATIONAL',
                                categoryName: '교육',
                                developer: 'GameDuckHu Corp.',
                                iconUrl: 'iconUrl32',
                                gender: 'male',
                                birthday: 1992,
                                job: 1,
                            },
                            ////////// end of me ///////////////
                            {
                                userId: 'peopleId1',
                                packageName: 'com.game.edu2',
                                totalUsedTime: 7000,
                                appName: '교육게임명2',
                                categoryId: 'GAME_EDUCATIONAL',
                                categoryName: '교육',
                                developer: 'GameDuckHu Corp.',
                                iconUrl: 'iconUrl32',
                                birthday: 1943,
                                job: 1,
                                gender: 'male',
                            }, {
                                userId: 'peopleId1',
                                packageName: 'com.game.rpg',
                                totalUsedTime: 4000,
                                appName: '롤플레잉게임명',
                                categoryId: 'GAME_ROLE_PLAYING',
                                categoryName: '롤플레잉',
                                developer: 'GameDuckHu Corp.',
                                iconUrl: 'iconUrl4',
                                birthday: 1943,
                                job: 1,
                                gender: 'male',
                            }, {
                                userId: 'peopleId2',
                                packageName: 'com.game.rpg',
                                totalUsedTime: 90000,
                                appName: '롤플레잉게임명',
                                categoryId: 'GAME_ROLE_PLAYING',
                                categoryName: '롤플레잉',
                                developer: 'GameDuckHu Corp.',
                                iconUrl: 'iconUrl4',
                                birthday: 1989,
                                job: 1,
                                gender: 'female',
                            }, {
                                userId: 'peopleId2',
                                packageName: 'com.game.puzzle',
                                totalUsedTime: 10000,
                                appName: '퍼즐게임명',
                                categoryId: 'GAME_PUZZLE',
                                categoryName: '퍼즐',
                                developer: 'Puzzle Game Corp.',
                                iconUrl: 'iconUrl6',
                                birthday: 1989,
                                job: 1,
                                gender: 'female',
                            }, {
                                userId: 'peopleId3',
                                packageName: 'com.game.edu',
                                totalUsedTime: 100000,
                                appName: '교육게임명',
                                categoryId: 'GAME_EDUCATIONAL',
                                categoryName: '교육',
                                developer: 'Edu Game Corp.',
                                iconUrl: 'iconUrl3',
                                birthday: 1990,
                                job: 2,
                                gender: 'male',
                            }, {
                                userId: 'peopleId3',
                                packageName: 'com.game.puzzle',
                                totalUsedTime: 50000,
                                appName: '퍼즐게임명',
                                categoryId: 'GAME_PUZZLE',
                                categoryName: '퍼즐',
                                developer: 'Puzzle Game Corp.',
                                iconUrl: 'iconUrl6',
                                birthday: 1990,
                                job: 2,
                                gender: 'male',
                            }, {
                                // 특정 앱의 사용 데이터는 있지만 비정규화 이전 버전 앱 사용으로 categoryId가 AppUsages에 없는 경우, 해당 앱은 제외한다.
                                userId: 'uninstalledOldPeople',
                                packageName: 'com.game.puzzle',
                                totalUsedTime: 7777777777
                            }]))
                        .then(() => Apps.create([{
                            packageName: 'com.nhn.android.nmap',
                            appName: '네이버지도',
                            categoryId1: 'TOOL',
                            categoryName1: '도구',
                            developer: 'NHN Corp.',
                            iconUrl: 'iconUrl0',
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
                            developer: 'GameDuckHu Corp.',
                            iconUrl: 'iconUrl4',
                        }, {
                            packageName: 'com.game.edu2',
                            appName: '교육게임명2',
                            categoryId1: 'GAME_EDUCATIONAL',
                            categoryName1: '교육',
                            developer: 'GameDuckHu Corp.',
                            iconUrl: 'iconUrl32',
                        }, {
                            packageName: 'com.game.puzzle',
                            appName: '퍼즐게임명',
                            categoryId1: 'GAME_PUZZLE',
                            categoryName1: '퍼즐',
                            developer: 'Puzzle Game Corp.',
                            iconUrl: 'iconUrl6',
                        }]))
                        .then(() => done());
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
                            res.body.totalUsedTimeRank[0].content.should.be.eql(150000);
                            res.body.totalUsedTimeRank[1].userId.should.be.eql(config.testUser.userId);
                            res.body.totalUsedTimeRank[1].rank.should.be.eql(2);
                            res.body.totalUsedTimeRank[1].content.should.be.eql(105000);
                            res.body.totalUsedTimeRank[2].userId.should.be.eql("peopleId1");
                            res.body.totalUsedTimeRank[2].rank.should.be.eql(4);
                            res.body.totalUsedTimeRank[2].content.should.be.eql(11000);

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
                            res.body.totalUsedTimeRank[0].content.should.be.eql(150000);
                            res.body.totalUsedTimeRank[1].userId.should.be.eql("peopleId1");
                            res.body.totalUsedTimeRank[1].rank.should.be.eql(3);
                            res.body.totalUsedTimeRank[1].content.should.be.eql(11000);
                            done();
                        }).catch(err => done(err))
                });
            });

            afterEach(done => {
                Users.remove({}, () => {
                    AppUsages.remove({}, () => {
                        Apps.remove({}, done);
                    });
                });
            });
        });

        describe('특정 카테고리의 앱 사용 누적시간 데이터가 반환된다', () => {
            before(done => {
                Users.create([
                    config.testUser,
                    {
                        userId: 'peopleId1',
                        birthday: 1943,
                        job: 1,
                        gender: 'male',
                    },
                    {
                        userId: 'peopleId2',
                        birthday: 1989,
                        job: 1,
                        gender: 'female',
                    },
                    {
                        userId: 'peopleId3',
                        birthday: 1990,
                        job: 2,
                        gender: 'male',
                    },
                ], () => AppUsages.create([
                    ////////// start of me ///////////////
                    {
                        userId: config.testUser.userId,
                        gender: 'male',
                        birthday: 1992,
                        job: 1,
                        packageName: 'com.nhn.android.nmap',
                        totalUsedTime: 9999,
                        appName: '네이버지도',
                        categoryId: 'TOOL',
                        categoryName: '도구',
                        developer: 'NHN Corp.',
                        iconUrl: 'iconUrl0',
                    }, {
                        // 특정 앱의 사용 데이터는 있지만 해당 앱 정보가 DB에 없는 경우, 해당 앱은 제외한다.
                        userId: config.testUser.userId,
                        gender: 'male',
                        birthday: 1992,
                        job: 1,
                        packageName: 'com.game.empty',
                        totalUsedTime: 10000
                    }, {
                        userId: config.testUser.userId,
                        gender: 'male',
                        birthday: 1992,
                        job: 1,
                        packageName: 'com.game.edu',
                        totalUsedTime: 90000,
                        appName: '교육게임명',
                        categoryId: 'GAME_EDUCATIONAL',
                        categoryName: '교육',
                        developer: 'Edu Game Corp.',
                        iconUrl: 'iconUrl3',
                    }, {
                        userId: config.testUser.userId,
                        gender: 'male',
                        birthday: 1992,
                        job: 1,
                        packageName: 'com.game.rpg',
                        totalUsedTime: 10000,
                        appName: '롤플레잉게임명',
                        categoryId: 'GAME_ROLE_PLAYING',
                        categoryName: '롤플레잉',
                        developer: 'GameDuckHu Corp.',
                        iconUrl: 'iconUrl4',
                    }, {
                        userId: config.testUser.userId,
                        gender: 'male',
                        birthday: 1992,
                        job: 1,
                        packageName: 'com.game.edu2',
                        totalUsedTime: 5000,
                        appName: '교육게임명2',
                        categoryId: 'GAME_EDUCATIONAL',
                        categoryName: '교육',
                        developer: 'GameDuckHu Corp.',
                        iconUrl: 'iconUrl32',
                    },
                    ////////// end of me ///////////////
                    {
                        userId: 'peopleId1',
                        birthday: 1943,
                        job: 1,
                        gender: 'male',
                        packageName: 'com.game.edu2',
                        totalUsedTime: 7000,
                        appName: '교육게임명2',
                        categoryId: 'GAME_EDUCATIONAL',
                        categoryName: '교육',
                        developer: 'GameDuckHu Corp.',
                        iconUrl: 'iconUrl32',
                    }, {
                        userId: 'peopleId1',
                        birthday: 1943,
                        job: 1,
                        gender: 'male',
                        packageName: 'com.game.rpg',
                        totalUsedTime: 4000,
                        appName: '롤플레잉게임명',
                        categoryId: 'GAME_ROLE_PLAYING',
                        categoryName: '롤플레잉',
                        developer: 'GameDuckHu Corp.',
                        iconUrl: 'iconUrl4',
                    }, {
                        userId: 'peopleId2',
                        birthday: 1989,
                        job: 1,
                        gender: 'female',
                        packageName: 'com.game.rpg',
                        totalUsedTime: 90000,
                        appName: '롤플레잉게임명',
                        categoryId: 'GAME_ROLE_PLAYING',
                        categoryName: '롤플레잉',
                        developer: 'GameDuckHu Corp.',
                        iconUrl: 'iconUrl4',
                    }, {
                        userId: 'peopleId2',
                        birthday: 1989,
                        job: 1,
                        gender: 'female',
                        packageName: 'com.game.puzzle',
                        totalUsedTime: 10000,
                        appName: '퍼즐게임명',
                        categoryId: 'GAME_PUZZLE',
                        categoryName: '퍼즐',
                        developer: 'Puzzle Game Corp.',
                        iconUrl: 'iconUrl6',
                    }, {
                        userId: 'peopleId3',
                        birthday: 1990,
                        job: 2,
                        gender: 'male',
                        packageName: 'com.game.edu',
                        totalUsedTime: 100000,
                        appName: '교육게임명',
                        categoryId: 'GAME_EDUCATIONAL',
                        categoryName: '교육',
                        developer: 'Edu Game Corp.',
                        iconUrl: 'iconUrl3',
                    }, {
                        userId: 'peopleId3',
                        birthday: 1990,
                        job: 2,
                        gender: 'male',
                        packageName: 'com.game.puzzle',
                        totalUsedTime: 50000,
                        appName: '퍼즐게임명',
                        categoryId: 'GAME_PUZZLE',
                        categoryName: '퍼즐',
                        developer: 'Puzzle Game Corp.',
                        iconUrl: 'iconUrl6',
                    }], function () {
                        done();
                }));
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
                            userAppUsage.length.should.be.eql(3);

                            userAppUsage[0].id.should.be.eql('com.game.edu');
                            userAppUsage[0].name.should.be.eql('교육게임명');
                            userAppUsage[0].totalUsedTime.should.be.eql(90000);
                            userAppUsage[0].appInfos.length.should.be.eql(1);
                            userAppUsage[0].appInfos[0].packageName.should.be.eql('com.game.edu');
                            userAppUsage[0].appInfos[0].appName.should.be.eql('교육게임명');
                            userAppUsage[0].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            userAppUsage[0].appInfos[0].categoryName.should.be.eql('교육');
                            userAppUsage[0].appInfos[0].developer.should.be.eql('Edu Game Corp.');
                            userAppUsage[0].appInfos[0].iconUrl.should.be.eql('iconUrl3');

                            userAppUsage[1].id.should.be.eql('com.game.rpg');
                            userAppUsage[1].name.should.be.eql('롤플레잉게임명');
                            userAppUsage[1].totalUsedTime.should.be.eql(10000);
                            userAppUsage[1].appInfos.length.should.be.eql(1);
                            userAppUsage[1].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            userAppUsage[1].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            userAppUsage[1].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            userAppUsage[1].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            userAppUsage[1].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            userAppUsage[1].appInfos[0].iconUrl.should.be.eql('iconUrl4');

                            userAppUsage[2].id.should.be.eql('com.game.edu2');
                            userAppUsage[2].name.should.be.eql('교육게임명2');
                            userAppUsage[2].totalUsedTime.should.be.eql(5000);
                            userAppUsage[2].appInfos.length.should.be.eql(1);
                            userAppUsage[2].appInfos[0].packageName.should.be.eql('com.game.edu2');
                            userAppUsage[2].appInfos[0].appName.should.be.eql('교육게임명2');
                            userAppUsage[2].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            userAppUsage[2].appInfos[0].categoryName.should.be.eql('교육');
                            userAppUsage[2].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            userAppUsage[2].appInfos[0].iconUrl.should.be.eql('iconUrl32');

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

                            userCategoryUsages[0].id.should.be.eql('GAME_EDUCATIONAL');
                            userCategoryUsages[0].name.should.be.eql('교육');
                            userCategoryUsages[0].totalUsedTime.should.be.eql(95000);
                            should.not.exist(userCategoryUsages[0].appInfos);

                            userCategoryUsages[1].id.should.be.eql('GAME_ROLE_PLAYING');
                            userCategoryUsages[1].name.should.be.eql('롤플레잉');
                            userCategoryUsages[1].totalUsedTime.should.be.eql(10000);
                            should.not.exist(userCategoryUsages[1].appInfos);

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

                            userDeveloperUsages.length.should.be.eql(2);

                            userDeveloperUsages[0].id.should.be.eql('Edu Game Corp.');
                            userDeveloperUsages[0].name.should.be.eql('Edu Game Corp.');
                            userDeveloperUsages[0].totalUsedTime.should.be.eql(90000);

                            userDeveloperUsages[0].appInfos.length.should.be.eql(1);

                            userDeveloperUsages[0].appInfos[0].packageName.should.be.eql('com.game.edu');
                            userDeveloperUsages[0].appInfos[0].totalUsedTime.should.be.eql(90000);
                            userDeveloperUsages[0].appInfos[0].appName.should.be.eql('교육게임명');
                            userDeveloperUsages[0].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            userDeveloperUsages[0].appInfos[0].categoryName.should.be.eql('교육');
                            userDeveloperUsages[0].appInfos[0].developer.should.be.eql('Edu Game Corp.');
                            userDeveloperUsages[0].appInfos[0].iconUrl.should.be.eql('iconUrl3');

                            userDeveloperUsages[1].id.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[1].name.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[1].totalUsedTime.should.be.eql(15000);

                            userDeveloperUsages[1].appInfos.length.should.be.eql(2);

                            userDeveloperUsages[1].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            userDeveloperUsages[1].appInfos[0].totalUsedTime.should.be.eql(10000);
                            userDeveloperUsages[1].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            userDeveloperUsages[1].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            userDeveloperUsages[1].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            userDeveloperUsages[1].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[1].appInfos[0].iconUrl.should.be.eql('iconUrl4');

                            userDeveloperUsages[1].appInfos[1].packageName.should.be.eql('com.game.edu2');
                            userDeveloperUsages[1].appInfos[1].totalUsedTime.should.be.eql(5000);
                            userDeveloperUsages[1].appInfos[1].appName.should.be.eql('교육게임명2');
                            userDeveloperUsages[1].appInfos[1].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            userDeveloperUsages[1].appInfos[1].categoryName.should.be.eql('교육');
                            userDeveloperUsages[1].appInfos[1].developer.should.be.eql('GameDuckHu Corp.');
                            userDeveloperUsages[1].appInfos[1].iconUrl.should.be.eql('iconUrl32');

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
                            genderAgeAppUsages.length.should.be.eql(4);

                            genderAgeAppUsages[0].id.should.be.eql('com.game.edu');
                            genderAgeAppUsages[0].name.should.be.eql('교육게임명');
                            genderAgeAppUsages[0].totalUsedTime.should.be.eql(190000);
                            genderAgeAppUsages[0].appInfos.length.should.be.eql(1);
                            genderAgeAppUsages[0].appInfos[0].packageName.should.be.eql('com.game.edu');
                            genderAgeAppUsages[0].appInfos[0].appName.should.be.eql('교육게임명');
                            genderAgeAppUsages[0].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            genderAgeAppUsages[0].appInfos[0].categoryName.should.be.eql('교육');
                            genderAgeAppUsages[0].appInfos[0].developer.should.be.eql('Edu Game Corp.');
                            genderAgeAppUsages[0].appInfos[0].iconUrl.should.be.eql('iconUrl3');

                            genderAgeAppUsages[1].id.should.be.eql('com.game.puzzle');
                            genderAgeAppUsages[1].name.should.be.eql('퍼즐게임명');
                            genderAgeAppUsages[1].totalUsedTime.should.be.eql(50000);
                            genderAgeAppUsages[1].appInfos.length.should.be.eql(1);
                            genderAgeAppUsages[1].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            genderAgeAppUsages[1].appInfos[0].appName.should.be.eql('퍼즐게임명');
                            genderAgeAppUsages[1].appInfos[0].categoryId.should.be.eql('GAME_PUZZLE');
                            genderAgeAppUsages[1].appInfos[0].categoryName.should.be.eql('퍼즐');
                            genderAgeAppUsages[1].appInfos[0].developer.should.be.eql('Puzzle Game Corp.');
                            genderAgeAppUsages[1].appInfos[0].iconUrl.should.be.eql('iconUrl6');

                            genderAgeAppUsages[2].id.should.be.eql('com.game.rpg');
                            genderAgeAppUsages[2].name.should.be.eql('롤플레잉게임명');
                            genderAgeAppUsages[2].totalUsedTime.should.be.eql(10000);
                            genderAgeAppUsages[2].appInfos.length.should.be.eql(1);
                            genderAgeAppUsages[2].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            genderAgeAppUsages[2].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            genderAgeAppUsages[2].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            genderAgeAppUsages[2].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            genderAgeAppUsages[2].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            genderAgeAppUsages[2].appInfos[0].iconUrl.should.be.eql('iconUrl4');

                            genderAgeAppUsages[3].id.should.be.eql('com.game.edu2');
                            genderAgeAppUsages[3].name.should.be.eql('교육게임명2');
                            genderAgeAppUsages[3].totalUsedTime.should.be.eql(5000);
                            genderAgeAppUsages[3].appInfos.length.should.be.eql(1);
                            genderAgeAppUsages[3].appInfos[0].packageName.should.be.eql('com.game.edu2');
                            genderAgeAppUsages[3].appInfos[0].appName.should.be.eql('교육게임명2');
                            genderAgeAppUsages[3].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            genderAgeAppUsages[3].appInfos[0].categoryName.should.be.eql('교육');
                            genderAgeAppUsages[3].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            genderAgeAppUsages[3].appInfos[0].iconUrl.should.be.eql('iconUrl32');

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

                            genderAgeCategoryUsages[0].id.should.be.eql('GAME_EDUCATIONAL');
                            genderAgeCategoryUsages[0].name.should.be.eql('교육');
                            genderAgeCategoryUsages[0].totalUsedTime.should.be.eql(195000);
                            should.not.exist(genderAgeCategoryUsages[0].appInfos);

                            genderAgeCategoryUsages[1].id.should.be.eql('GAME_PUZZLE');
                            genderAgeCategoryUsages[1].name.should.be.eql('퍼즐');
                            genderAgeCategoryUsages[1].totalUsedTime.should.be.eql(50000);
                            should.not.exist(genderAgeCategoryUsages[1].appInfos);

                            genderAgeCategoryUsages[2].id.should.be.eql('GAME_ROLE_PLAYING');
                            genderAgeCategoryUsages[2].name.should.be.eql('롤플레잉');
                            genderAgeCategoryUsages[2].totalUsedTime.should.be.eql(10000);
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

                            genderAgeDeveloperUsages.length.should.be.eql(3);
                            genderAgeDeveloperUsages[0].id.should.be.eql('Edu Game Corp.');
                            genderAgeDeveloperUsages[0].name.should.be.eql('Edu Game Corp.');
                            genderAgeDeveloperUsages[0].totalUsedTime.should.be.eql(190000);
                            genderAgeDeveloperUsages[0].appInfos.length.should.be.eql(1);
                            genderAgeDeveloperUsages[0].appInfos[0].packageName.should.be.eql('com.game.edu');
                            genderAgeDeveloperUsages[0].appInfos[0].totalUsedTime.should.be.eql(190000);

                            genderAgeDeveloperUsages[1].id.should.be.eql('Puzzle Game Corp.');
                            genderAgeDeveloperUsages[1].name.should.be.eql('Puzzle Game Corp.');
                            genderAgeDeveloperUsages[1].totalUsedTime.should.be.eql(50000);
                            genderAgeDeveloperUsages[1].appInfos.length.should.be.eql(1);
                            genderAgeDeveloperUsages[1].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            genderAgeDeveloperUsages[1].appInfos[0].totalUsedTime.should.be.eql(50000);

                            genderAgeDeveloperUsages[2].id.should.be.eql('GameDuckHu Corp.');
                            genderAgeDeveloperUsages[2].name.should.be.eql('GameDuckHu Corp.');
                            genderAgeDeveloperUsages[2].totalUsedTime.should.be.eql(15000);
                            genderAgeDeveloperUsages[2].appInfos.length.should.be.eql(2);
                            genderAgeDeveloperUsages[2].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            genderAgeDeveloperUsages[2].appInfos[0].totalUsedTime.should.be.eql(10000);
                            genderAgeDeveloperUsages[2].appInfos[1].packageName.should.be.eql('com.game.edu2');
                            genderAgeDeveloperUsages[2].appInfos[1].totalUsedTime.should.be.eql(5000);

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
                            jobAppUsages.length.should.be.eql(4);
                            jobAppUsages[0].id.should.be.eql('com.game.rpg');
                            jobAppUsages[0].name.should.be.eql('롤플레잉게임명');
                            jobAppUsages[0].totalUsedTime.should.be.eql(104000);
                            jobAppUsages[0].appInfos.length.should.be.eql(1);
                            jobAppUsages[0].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            jobAppUsages[0].appInfos[0].appName.should.be.eql('롤플레잉게임명');
                            jobAppUsages[0].appInfos[0].categoryId.should.be.eql('GAME_ROLE_PLAYING');
                            jobAppUsages[0].appInfos[0].categoryName.should.be.eql('롤플레잉');
                            jobAppUsages[0].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            jobAppUsages[0].appInfos[0].iconUrl.should.be.eql('iconUrl4');


                            jobAppUsages[1].id.should.be.eql('com.game.edu');
                            jobAppUsages[1].name.should.be.eql('교육게임명');
                            jobAppUsages[1].totalUsedTime.should.be.eql(90000);
                            jobAppUsages[1].appInfos.length.should.be.eql(1);
                            jobAppUsages[1].appInfos[0].packageName.should.be.eql('com.game.edu');
                            jobAppUsages[1].appInfos[0].appName.should.be.eql('교육게임명');
                            jobAppUsages[1].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            jobAppUsages[1].appInfos[0].categoryName.should.be.eql('교육');
                            jobAppUsages[1].appInfos[0].developer.should.be.eql('Edu Game Corp.');
                            jobAppUsages[1].appInfos[0].iconUrl.should.be.eql('iconUrl3');

                            jobAppUsages[2].id.should.be.eql('com.game.edu2');
                            jobAppUsages[2].name.should.be.eql('교육게임명2');
                            jobAppUsages[2].totalUsedTime.should.be.eql(12000);
                            jobAppUsages[2].appInfos.length.should.be.eql(1);
                            jobAppUsages[2].appInfos[0].packageName.should.be.eql('com.game.edu2');
                            jobAppUsages[2].appInfos[0].appName.should.be.eql('교육게임명2');
                            jobAppUsages[2].appInfos[0].categoryId.should.be.eql('GAME_EDUCATIONAL');
                            jobAppUsages[2].appInfos[0].categoryName.should.be.eql('교육');
                            jobAppUsages[2].appInfos[0].developer.should.be.eql('GameDuckHu Corp.');
                            jobAppUsages[2].appInfos[0].iconUrl.should.be.eql('iconUrl32');

                            jobAppUsages[3].id.should.be.eql('com.game.puzzle');
                            jobAppUsages[3].name.should.be.eql('퍼즐게임명');
                            jobAppUsages[3].totalUsedTime.should.be.eql(10000);
                            jobAppUsages[3].appInfos.length.should.be.eql(1);
                            jobAppUsages[3].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            jobAppUsages[3].appInfos[0].appName.should.be.eql('퍼즐게임명');
                            jobAppUsages[3].appInfos[0].categoryId.should.be.eql('GAME_PUZZLE');
                            jobAppUsages[3].appInfos[0].categoryName.should.be.eql('퍼즐');
                            jobAppUsages[3].appInfos[0].developer.should.be.eql('Puzzle Game Corp.');
                            jobAppUsages[3].appInfos[0].iconUrl.should.be.eql('iconUrl6');

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
                            jobCategoryUsages[0].totalUsedTime.should.be.eql(104000);
                            should.not.exist(jobCategoryUsages[0].appInfos);

                            jobCategoryUsages[1].id.should.be.eql('GAME_EDUCATIONAL');
                            jobCategoryUsages[1].name.should.be.eql('교육');
                            jobCategoryUsages[1].totalUsedTime.should.be.eql(102000);
                            should.not.exist(jobCategoryUsages[1].appInfos);

                            jobCategoryUsages[2].id.should.be.eql('GAME_PUZZLE');
                            jobCategoryUsages[2].name.should.be.eql('퍼즐');
                            jobCategoryUsages[2].totalUsedTime.should.be.eql(10000);
                            should.not.exist(jobCategoryUsages[2].appInfos);

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

                            jobDeveloperUsages.length.should.be.eql(3);
                            jobDeveloperUsages[0].id.should.be.eql('GameDuckHu Corp.');
                            jobDeveloperUsages[0].name.should.be.eql('GameDuckHu Corp.');
                            jobDeveloperUsages[0].totalUsedTime.should.be.eql(116000);
                            jobDeveloperUsages[0].appInfos.length.should.be.eql(2);
                            jobDeveloperUsages[0].appInfos[0].packageName.should.be.eql('com.game.rpg');
                            jobDeveloperUsages[0].appInfos[0].totalUsedTime.should.be.eql(104000);
                            jobDeveloperUsages[0].appInfos[1].packageName.should.be.eql('com.game.edu2');
                            jobDeveloperUsages[0].appInfos[1].totalUsedTime.should.be.eql(12000);

                            jobDeveloperUsages[1].id.should.be.eql('Edu Game Corp.');
                            jobDeveloperUsages[1].name.should.be.eql('Edu Game Corp.');
                            jobDeveloperUsages[1].totalUsedTime.should.be.eql(90000);
                            jobDeveloperUsages[1].appInfos.length.should.be.eql(1);
                            jobDeveloperUsages[1].appInfos[0].packageName.should.be.eql('com.game.edu');
                            jobDeveloperUsages[1].appInfos[0].totalUsedTime.should.be.eql(90000);

                            jobDeveloperUsages[2].id.should.be.eql('Puzzle Game Corp.');
                            jobDeveloperUsages[2].name.should.be.eql('Puzzle Game Corp.');
                            jobDeveloperUsages[2].totalUsedTime.should.be.eql(10000);
                            jobDeveloperUsages[2].appInfos.length.should.be.eql(1);
                            jobDeveloperUsages[2].appInfos[0].packageName.should.be.eql('com.game.puzzle');
                            jobDeveloperUsages[2].appInfos[0].totalUsedTime.should.be.eql(10000);

                            done();
                        }).catch(err => done(err));
                });
            });

            after(done => {
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