const chai = require('chai');
const sinon = require('sinon');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const Users = require('../models/users').Users;
const AppUsages = require('../models/appUsages').AppUsages;
const Apps = require('../models/appUsages').Apps;
const helper = require('./commonTestHelper');
const dummy = require('./dummy').recommend;

describe('Recommend', () => {
    const sandbox = sinon.createSandbox();

    before(done => {
        helper.commonBefore()
            .then(() => done())
            .catch(err => done(err));
    });

    describe('GET /recommend/apps', () => {
        before(done => {
            const wishedByTestUser = ['com.game.edu3', 'com.game.puzzle'];

            Users.findOneAndUpdate({userId : config.testUser.userId}, {$set: {wishList: wishedByTestUser}})
                .then(() => AppUsages.create(dummy.recommendAppUsages))
                .then(() => done())
                .catch(err => done(err))
        });

        beforeEach(() => {
            sandbox.useFakeTimers(new Date("2019-04-19T00:00:00.000Z").getTime());
        });

        it('추천 게임 리스트 1페이지를 반환한다', done => {
            request.get('/recommend/apps/GAME?page=1&eachLimit=2')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then((res) => {
                    res.body.length.should.be.eql(7);

                    // Similar User
                    res.body[0].recommendType.should.be.eql(4);
                    res.body[0].criteria.should.be.eql(["20대","남성"]);
                    res.body[0].rank.should.be.eql(1);
                    res.body[0].app.packageName.should.be.eql('com.game.puzzle');
                    res.body[0].app.appName.should.be.eql('퍼즐게임명');
                    res.body[0].app.categoryId.should.be.eql('GAME_PUZZLE');
                    res.body[0].app.categoryName.should.be.eql('퍼즐');
                    res.body[0].app.developer.should.be.eql('Puzzle Game Corp.');
                    res.body[0].app.iconUrl.should.be.eql('iconUrl6');
                    res.body[0].app.totalUsedTime.should.be.eql(50000);
                    res.body[0].app.isWished.should.be.eql(true);

                    // Category
                    res.body[1].recommendType.should.be.eql(3);
                    res.body[1].criteria.should.be.eql(["교육"]);
                    res.body[1].rank.should.be.eql(1);
                    res.body[1].app.packageName.should.be.eql('com.game.edu3');
                    res.body[1].app.appName.should.be.eql('교육게임명3');
                    res.body[1].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                    res.body[1].app.categoryName.should.be.eql('교육');
                    res.body[1].app.developer.should.be.eql('GameDuckHu Corp.');
                    res.body[1].app.iconUrl.should.be.eql('iconUrl33');
                    res.body[1].app.totalUsedTime.should.be.eql(15000);
                    res.body[1].app.isWished.should.be.eql(true);

                    // Developer
                    res.body[2].recommendType.should.be.eql(2);
                    res.body[2].criteria.should.be.eql(["Edu Game Corp."]);
                    res.body[2].rank.should.be.eql(1);
                    res.body[2].app.packageName.should.be.eql('com.game.edurpg');
                    res.body[2].app.appName.should.be.eql('교육RPG');
                    res.body[2].app.categoryId.should.be.eql('GAME_ROLE_PLAYING');
                    res.body[2].app.categoryName.should.be.eql('롤플레잉');
                    res.body[2].app.developer.should.be.eql('Edu Game Corp.');
                    res.body[2].app.iconUrl.should.be.eql('iconUrl3');
                    res.body[2].app.totalUsedTime.should.be.eql(47300);
                    res.body[2].app.isWished.should.be.eql(false);

                    // Favorite App
                    res.body[3].recommendType.should.be.eql(1);
                    res.body[3].criteria.should.be.eql(['교육게임명']);
                    res.body[3].rank.should.be.eql(1);
                    res.body[3].app.packageName.should.be.eql('com.game.puzzle');
                    res.body[3].app.appName.should.be.eql('퍼즐게임명');
                    res.body[3].app.categoryId.should.be.eql('GAME_PUZZLE');
                    res.body[3].app.categoryName.should.be.eql('퍼즐');
                    res.body[3].app.developer.should.be.eql('Puzzle Game Corp.');
                    res.body[3].app.iconUrl.should.be.eql('iconUrl6');
                    res.body[3].app.totalUsedTime.should.be.eql(50000);
                    res.body[3].app.isWished.should.be.eql(true);

                    res.body[4].recommendType.should.be.eql(4);
                    res.body[4].criteria.should.be.eql(["20대","남성"]);
                    res.body[4].rank.should.be.eql(2);
                    res.body[4].app.packageName.should.be.eql('com.game.edurpg');
                    res.body[4].app.appName.should.be.eql('교육RPG');
                    res.body[4].app.categoryId.should.be.eql('GAME_ROLE_PLAYING');
                    res.body[4].app.categoryName.should.be.eql('롤플레잉');
                    res.body[4].app.developer.should.be.eql('Edu Game Corp.');
                    res.body[4].app.iconUrl.should.be.eql('iconUrl3');
                    res.body[4].app.totalUsedTime.should.be.eql(47000);
                    res.body[4].app.isWished.should.be.eql(false);

                    res.body[5].recommendType.should.be.eql(3);
                    res.body[5].criteria.should.be.eql(["교육"]);
                    res.body[5].rank.should.be.eql(2);
                    res.body[5].app.packageName.should.be.eql('com.game.edu4');
                    res.body[5].app.appName.should.be.eql('교육게임명4');
                    res.body[5].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                    res.body[5].app.categoryName.should.be.eql('교육');
                    res.body[5].app.developer.should.be.eql('GameDuckHu Corp.');
                    res.body[5].app.iconUrl.should.be.eql('iconUrl33');
                    res.body[5].app.totalUsedTime.should.be.eql(3000);
                    res.body[5].app.isWished.should.be.eql(false);

                    res.body[6].recommendType.should.be.eql(1);
                    res.body[6].criteria.should.be.eql(['교육게임명']);
                    res.body[6].rank.should.be.eql(2);
                    res.body[6].app.packageName.should.be.eql('com.game.edu4');
                    res.body[6].app.appName.should.be.eql('교육게임명4');
                    res.body[6].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                    res.body[6].app.categoryName.should.be.eql('교육');
                    res.body[6].app.developer.should.be.eql('GameDuckHu Corp.');
                    res.body[6].app.iconUrl.should.be.eql('iconUrl33');
                    res.body[6].app.totalUsedTime.should.be.eql(3000);
                    res.body[6].app.isWished.should.be.eql(false);

                    done();
                }).catch(err => done(err));
        });

        it('추천 게임 리스트 2페이지를 반환한다', done => {
            request.get('/recommend/apps/GAME?page=2&eachLimit=2')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then((res) => {
                    // res.body.length.should.be.eql(3);

                    res.body[0].recommendType.should.be.eql(4);
                    res.body[0].criteria.should.be.eql(["20대","남성"]);
                    res.body[0].rank.should.be.eql(1);
                    res.body[0].app.packageName.should.be.eql('com.game.edu3');
                    res.body[0].app.appName.should.be.eql('교육게임명3');
                    res.body[0].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                    res.body[0].app.categoryName.should.be.eql('교육');
                    res.body[0].app.developer.should.be.eql('GameDuckHu Corp.');
                    res.body[0].app.iconUrl.should.be.eql('iconUrl33');
                    res.body[0].app.totalUsedTime.should.be.eql(15000);
                    res.body[0].app.isWished.should.be.eql(true);

                    res.body[1].recommendType.should.be.eql(1);
                    res.body[1].criteria.should.be.eql(['교육게임명']);
                    res.body[1].rank.should.be.eql(1);
                    res.body[1].app.packageName.should.be.eql('com.game.edurpg');
                    res.body[1].app.appName.should.be.eql('교육RPG');
                    res.body[1].app.categoryId.should.be.eql('GAME_ROLE_PLAYING');
                    res.body[1].app.categoryName.should.be.eql('롤플레잉');
                    res.body[1].app.developer.should.be.eql('Edu Game Corp.');
                    res.body[1].app.iconUrl.should.be.eql('iconUrl3');
                    res.body[1].app.totalUsedTime.should.be.eql(2000);
                    res.body[1].app.isWished.should.be.eql(false);

                    res.body[2].recommendType.should.be.eql(4);
                    res.body[2].criteria.should.be.eql(["20대","남성"]);
                    res.body[2].rank.should.be.eql(2);
                    res.body[2].app.packageName.should.be.eql('com.game.edu4');
                    res.body[2].app.appName.should.be.eql('교육게임명4');
                    res.body[2].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                    res.body[2].app.categoryName.should.be.eql('교육');
                    res.body[2].app.developer.should.be.eql('GameDuckHu Corp.');
                    res.body[2].app.iconUrl.should.be.eql('iconUrl33');
                    res.body[2].app.totalUsedTime.should.be.eql(3000);
                    res.body[2].app.isWished.should.be.eql(false);

                    done();
                }).catch(err => done(err));
        });

        it('범위를 초과한 페이징 정보를 입력한 경우 빈 값을 리턴한다', done => {
            request.get('/recommend/apps/GAME?page=3&eachLimit=2')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then((res) => {
                    res.body.should.be.eql([]);

                    done();
                }).catch(err => done(err));
        });

        describe('본인의 앱 사용 데이터가 없을 시', function () {
            let testUserAppUsages;

            before(done => {
                AppUsages.find({userId: config.testUser.userId})
                    .then(appUsages => {
                        testUserAppUsages = appUsages;
                        return AppUsages.remove({userId: config.testUser.userId});
                    })
                    .then(() => done())
                    .catch(err => done(err))
            });

            it('데모그래픽 목록만 반환한다', done => {
                request.get('/recommend/apps/GAME?page=1')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(200)
                    .then((res) => {
                        res.body.forEach(recommendApp => {
                            recommendApp.recommendType.should.be.eql(4);
                        });

                        done();
                    }).catch(err => done(err));
            });

            after(done => {
                AppUsages.create(testUserAppUsages)
                    .then(() => done())
                    .catch(err => done(err));
            });
        });

        describe('잘못된 페이징 정보 입력 시', function () {
            // TODO : sandbox.restore() 짝을 맞춰야한다
            beforeEach(() => {
                sandbox.restore();
            });

            it('페이징 옵션 미지정 시 412오류를 반환한다', done => {
                request.get('/recommend/apps/GAME')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(412, done);
            });

            it('페이징 옵션으로 0 이하의 값을 지정 시 412오류를 반환한다', done => {
                request.get('/recommend/apps/GAME?page=-1')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(412, done);
            });

            it('페이징 옵션으로 문자 입력 시 412오류를 반환한다', done => {
                request.get('/recommend/apps/GAME?page=a')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(412, done);
            });
        });

        afterEach(() => {
            sandbox.restore();
        });

        after(done => {
            Users.remove({})
                .then(() => AppUsages.remove({}))
                .then(() => Apps.remove({}))
                .then(() => done())
                .catch(err => done(err));
        });
    });

    after(done => {
        helper.commonAfter()
            .then(() => done())
            .catch(err => done(err));
    });
});