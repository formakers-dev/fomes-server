const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const Users = require('../models/users').Users;
const AppUsages = require('../models/appUsages').AppUsages;
const Apps = require('../models/appUsages').Apps;

describe('Recommend', () => {
   describe('GET /recommend/similar/demographic', () => {
       before(done => {
               Users.create(config.testUser)
                   .then(() => AppUsages.create([
                       ////////// start of me ///////////////
                       {
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
                           gender: 'male',
                           birthday: 1992,
                           job: 1,
                           developer: 'Edu Game Corp.',
                           categoryId: 'GAME_EDUCATIONAL',
                       }, {
                           userId: config.testUser.userId,
                           packageName: 'com.game.rpg',
                           totalUsedTime: 10000,
                           gender: 'male',
                           birthday: 1992,
                           job: 1,
                           developer: 'GameDuckHu Corp.',
                           categoryId: 'GAME_ROLE_PLAYING',
                       }, {
                           userId: config.testUser.userId,
                           packageName: 'com.game.edu2',
                           totalUsedTime: 5000,
                           gender: 'male',
                           birthday: 1992,
                           job: 1,
                           developer: 'GameDuckHu Corp.',
                           categoryId: 'GAME_EDUCATIONAL',
                       },
                       ////////// end of me ///////////////
                       {
                           userId: 'peopleId1',
                           packageName: 'com.game.edu2',
                           totalUsedTime: 7000,
                           birthday: 1943,
                           job: 1,
                           gender: 'male',
                           developer: 'GameDuckHu Corp.',
                           categoryId: 'GAME_EDUCATIONAL',
                       }, {
                           userId: 'peopleId1',
                           packageName: 'com.game.rpg',
                           totalUsedTime: 4000,
                           birthday: 1943,
                           job: 1,
                           gender: 'male',
                           developer: 'GameDuckHu Corp.',
                           categoryId: 'GAME_ROLE_PLAYING',
                       }, {
                           userId: 'peopleId2',
                           packageName: 'com.game.rpg',
                           totalUsedTime: 90000,
                           birthday: 1989,
                           job: 1,
                           gender: 'female',
                           developer: 'GameDuckHu Corp.',
                           categoryId: 'GAME_ROLE_PLAYING',
                       }, {
                           userId: 'peopleId2',
                           packageName: 'com.game.puzzle',
                           totalUsedTime: 10000,
                           birthday: 1989,
                           job: 1,
                           gender: 'female',
                           developer: 'Puzzle Game Corp.',
                           categoryId: 'GAME_PUZZLE',
                       }, {
                           userId: 'peopleId3',
                           packageName: 'com.game.edu',
                           totalUsedTime: 100000,
                           birthday: 1990,
                           job: 2,
                           gender: 'male',
                           developer: 'Edu Game Corp.',
                           categoryId: 'GAME_EDUCATIONAL',
                       }, {
                           userId: 'peopleId3',
                           packageName: 'com.game.puzzle',
                           totalUsedTime: 50000,
                           birthday: 1990,
                           job: 2,
                           gender: 'male',
                           developer: 'Puzzle Game Corp.',
                           categoryId: 'GAME_PUZZLE',
                       }
                   ]))
                   .then(() => Apps.create([
                       {
                           packageName: 'com.nhn.android.nmap',
                           appName: '네이버지도',
                           developer: 'NHN Corp.',
                           categoryId1: 'TOOL',
                           categoryName1: '도구',
                           iconUrl: 'iconUrl0',
                       }, {
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
                       }, {
                           packageName: 'com.game.puzzle',
                           appName: '퍼즐게임명',
                           developer: 'Puzzle Game Corp.',
                           categoryId1: 'GAME_PUZZLE',
                           categoryName1: '퍼즐',
                           iconUrl: 'iconUrl6',
                           wishedBy: ['user4', config.testUser.userId]
                       }]))
                   .then(() => done())
                   .catch(err => done(err))
           });

       it('나이/성별이 동일한 게이머들의 게임들 리스트를 반환한다', done => {
           request.get('/recommend/similar/demographic')
               .set('x-access-token', config.appbeeToken.valid)
               .expect(200)
               .then((res) => {

                   // gender + age
                   // people 3
                   res.body.length.should.be.eql(4);

                   res.body[0].criteria.length.should.be.eql(2);
                   res.body[0].criteria[0].should.be.eql("20대");
                   res.body[0].criteria[1].should.be.eql("남성");

                   res.body[0].app.packageName.should.be.eql('com.game.edu');
                   res.body[0].app.appName.should.be.eql('교육게임명');
                   res.body[0].app.totalUsedTime.should.be.eql(190000);
                   res.body[0].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                   res.body[0].app.categoryName.should.be.eql('교육');
                   res.body[0].app.developer.should.be.eql('Edu Game Corp.');
                   res.body[0].app.iconUrl.should.be.eql('iconUrl3');
                   res.body[0].app.wishedByMe.should.be.eql(true);

                   res.body[1].criteria.length.should.be.eql(2);
                   res.body[1].criteria[0].should.be.eql("20대");
                   res.body[1].criteria[1].should.be.eql("남성");

                   res.body[1].app.packageName.should.be.eql('com.game.puzzle');
                   res.body[1].app.totalUsedTime.should.be.eql(50000);
                   res.body[1].app.appName.should.be.eql('퍼즐게임명');
                   res.body[1].app.categoryId.should.be.eql('GAME_PUZZLE');
                   res.body[1].app.categoryName.should.be.eql('퍼즐');
                   res.body[1].app.developer.should.be.eql('Puzzle Game Corp.');
                   res.body[1].app.iconUrl.should.be.eql('iconUrl6');
                   res.body[1].app.wishedByMe.should.be.eql(true);

                   res.body[2].criteria.length.should.be.eql(2);
                   res.body[2].criteria[0].should.be.eql("20대");
                   res.body[2].criteria[1].should.be.eql("남성");

                   res.body[2].app.packageName.should.be.eql('com.game.rpg');
                   res.body[2].app.appName.should.be.eql('롤플레잉게임명');
                   res.body[2].app.totalUsedTime.should.be.eql(10000);
                   res.body[2].app.categoryId.should.be.eql('GAME_ROLE_PLAYING');
                   res.body[2].app.categoryName.should.be.eql('롤플레잉');
                   res.body[2].app.developer.should.be.eql('GameDuckHu Corp.');
                   res.body[2].app.iconUrl.should.be.eql('iconUrl4');
                   res.body[2].app.wishedByMe.should.be.eql(false);

                   res.body[3].criteria.length.should.be.eql(2);
                   res.body[3].criteria[0].should.be.eql("20대");
                   res.body[3].criteria[1].should.be.eql("남성");

                   res.body[3].app.packageName.should.be.eql('com.game.edu2');
                   res.body[3].app.appName.should.be.eql('교육게임명2');
                   res.body[3].app.totalUsedTime.should.be.eql(5000);
                   res.body[3].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                   res.body[3].app.categoryName.should.be.eql('교육');
                   res.body[3].app.developer.should.be.eql('GameDuckHu Corp.');
                   res.body[3].app.iconUrl.should.be.eql('iconUrl32');
                   res.body[3].app.wishedByMe.should.be.eql(false);

                   done();
               }).catch(err => done(err));
       });

       it('페이징 옵션 지정 시 지정된 개수의 리스트를 반환한다', done => {
           request.get('/recommend/similar/demographic?page=1&limit=1')
               .set('x-access-token', config.appbeeToken.valid)
               .expect(200)
               .then((res) => {
                   // gender + age
                   // people 3
                   res.body.length.should.be.eql(1);

                   res.body[0].criteria.length.should.be.eql(2);
                   res.body[0].criteria[0].should.be.eql("20대");
                   res.body[0].criteria[1].should.be.eql("남성");

                   res.body[0].app.packageName.should.be.eql('com.game.edu');
                   res.body[0].app.appName.should.be.eql('교육게임명');
                   res.body[0].app.totalUsedTime.should.be.eql(190000);
                   res.body[0].app.categoryId.should.be.eql('GAME_EDUCATIONAL');
                   res.body[0].app.categoryName.should.be.eql('교육');
                   res.body[0].app.developer.should.be.eql('Edu Game Corp.');
                   res.body[0].app.iconUrl.should.be.eql('iconUrl3');

                   done();
               }).catch(err => done(err));
       });

       after(done => {
           Users.remove({})
               .then(() => AppUsages.remove({}))
               .then(() => Apps.remove({}))
               .then(() => done())
               .catch(err => done(err));
       });
   })
});