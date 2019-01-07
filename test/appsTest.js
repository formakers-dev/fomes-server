const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = require('chai').should();
const {Apps} = require('../models/appUsages');
const helper = require('./commonTestHelper');

describe('Apps', () => {
    before(done => {
        helper.commonBefore()
            .then(() => done())
            .catch(err => done(err));
    });

    describe('GET /apps/:packageName', () => {
        before(done => {
            Apps.create([{
                    packageName: 'com.game.edu',
                    appName: '교육게임명',
                    categoryId1: 'GAME_EDUCATIONAL',
                    categoryName1: '교육',
                    developer: 'Edu Game Corp.',
                    iconUrl: 'http://edu-icon-url.com',
                    star: 3.4,
                    installsMin: 50000,
                    installsMax: 100000,
                    contentsRating: '만 12세 이상',
                    imageUrls: ['http://edu-url.com', 'http://edu-url2.com'],
                    wishedBy: ['user1', config.testUser.userId],
                }, {
                    packageName: 'com.game.rpg',
                    appName: '롤플레잉게임명',
                    categoryId1: 'GAME_ROLE_PLAYING',
                    categoryName1: '롤플레잉',
                    developer: 'Rpg Game Corp.',
                    iconUrl: 'http://rpg-icon-url.com',
                    star: 5.0,
                    installsMin: 1000000,
                    installsMax: 10000000,
                    contentsRating: '만 19세 이상',
                    imageUrls: ['http://rpg-url'],
                    wishedBy: [],
                }])
                .then(() => done());
        });

        it('요청한 앱 정보를 전송한다', done => {
            request.get('/apps/com.game.edu')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    const app = res.body;

                    app.packageName.should.be.eql('com.game.edu');
                    app.appName.should.be.eql('교육게임명');
                    app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                    app.categoryName.should.be.eql('교육');
                    app.developer.should.be.eql('Edu Game Corp.');
                    app.iconUrl.should.be.eql('http://edu-icon-url.com');
                    app.star.should.be.eql(3.4);
                    app.installsMin.should.be.eql(50000);
                    app.installsMax.should.be.eql(100000);
                    app.contentsRating.should.be.eql('만 12세 이상');
                    app.imageUrls.should.be.eql(['http://edu-url.com', 'http://edu-url2.com']);
                    app.isWished.should.be.eql(true);

                    done();
                })
                .catch(err => done(err));
        });


        it('DB에 없는 packageName으로 조회를 요청한 경우 412를 리턴한다', done => {
            request.get('/apps/not.registered.app')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(412)
                .then(() => done())
                .catch(err => done(err));
        });


        after(done => {
            Apps.remove({}, done);
        });
    });

    after(done => {
        helper.commonAfter()
            .then(() => done())
            .catch(err => done(err));
    })
});