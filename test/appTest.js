const sinon = require('sinon');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = require('chai').should();
const { Apps } = require('../models/appUsages');

describe('Apps', () => {
    const sandbox = sinon.sandbox.create();

    describe('POST /apps/category/:categoryId', () => {
        let testUser = config.testUser;

        before(done => {
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

        it('요청한 카테고리의 앱 정보 리스트를 전송한다', done => {
            request.get('/apps/category/GAME')
                .set('x-access-token', config.appbeeToken.valid)
                .send(testUser)
                .expect(200)
                .then(res => {
                    const apps = res.body;

                    console.log(apps);
                    apps.length.should.be.eql(2);

                    apps.sort((a, b) => a.packageName > b.packageName ? 1 : -1);

                    apps[0].packageName.should.be.eql('com.game.edu');
                    apps[1].packageName.should.be.eql('com.game.rpg');

                    done();
                })
                .catch(err => done(err));
        });

        after(done => {
            Apps.remove({}, done);
        });
    });
});