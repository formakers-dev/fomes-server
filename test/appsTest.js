const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const { AppUsages, Apps } = require('../models/appUsages');
const should = chai.should();

describe('Apps', () => {
    describe('POST appUsages', () => {

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
            request.post('/apps/usages')
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
            request.post('/apps/usages')
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
            request.post('/apps/usages')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });

        it('빈 앱 사용기록을 전송한 경우, 아무 처리없이 200을 리턴한다.', done => {
            request.post('/apps/usages')
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

    describe('GET appUsages by category', () => {
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
            request.get('/apps/usages/category/TOOL')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);

                    res.body[0].userId.should.be.eql(config.testUser.userId);

                    done();
                }).catch(err => done(err));
        });

        it('지정한 카테고리의 앱 누적 사용 데이터들을 리턴한다', done => {
            request.get('/apps/usages/category/COMMUNICATION')
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
            request.get('/apps/usages/category/GAME')
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

    describe('GET rank of appUsages group by category', () => {
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

        describe('/apps/usages/rank/category 가 호출되면', () => {
            it('카테고리별 앱 사용 시간을 합산하여 정렬된 리스트를 반환한다', done => {
                request.get('/apps/usages/rank/category')
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
                request.get('/apps/usages/rank/category')
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