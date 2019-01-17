const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');
const axios = require('axios');
const should = chai.should();

const BetaTests = require('../models/betaTests');
const helper = require('./commonTestHelper');

describe('BetaTests', () => {
    const sandbox = sinon.createSandbox();

    const data = [
        {
            id : 1,
            title : "전체 유저 대상 테스트",
            subTitle: "targetUserIds 가 없어요",
            type: "ONLINE",
            typeTags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com'
        }, {
            id : 2,
            title : "타겟팅 된 테스트",
            subTitle: "적합한 테스터는 너야너 너야너",
            type: "ONLINE",
            typeTags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            targetUserIds: [config.testUser.userId, "anotherUserId"]
        }, {
            id : 3,
            title : "타겟팅 되지 않은 테스트",
            subTitle: "응 탈락",
            type: "ONLINE",
            typeTags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            targetUserIds: ['anotherUserId']
        }, {
            id : 4,
            title : "아무도 타겟팅 되지 않은 테스트",
            subTitle: "응 모두 탈락",
            type: "ONLINE",
            typeTags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            targetUserIds: []
        },  {
            id : 5,
            title : "이미 참여한 테스트",
            subTitle: "참여했다",
            type: "ONLINE",
            typeTags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            completedUserIds: [config.testUser.userId],
        }
    ];

    before(done => {
        helper.commonBefore()
            .then(() => done())
            .catch(err => done(err));
    });

    beforeEach(done => {
        BetaTests.create(data)
            .then(() => done())
            .catch(err => done(err));
    });

    describe('GET /beta-tests', () => {

        it('참여 가능한 피드백 요청 목록을 조회한다', done => {
            sandbox.useFakeTimers(new Date("2018-12-28T02:30:00.000Z").getTime());

            request.get('/beta-tests')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.sort((a, b) => a.title > b.title ? 1 : -1);

                    res.body.length.should.be.eql(3);

                    res.body[0].title.should.be.eql('이미 참여한 테스트');
                    res.body[0].subTitle.should.be.eql('참여했다');
                    res.body[0].type.should.be.eql('ONLINE');
                    res.body[0].typeTags.length.should.be.eql(2);
                    res.body[0].typeTags[0].should.be.eql('1:1');
                    res.body[0].typeTags[1].should.be.eql('인터뷰');
                    res.body[0].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[0].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[0].actionType.should.be.eql('link');
                    res.body[0].action.should.be.eql('https://www.google.com');
                    res.body[0].isOpened.should.be.eql(true);
                    res.body[0].isCompleted.should.be.eql(true);

                    res.body[1].title.should.be.eql('전체 유저 대상 테스트');
                    res.body[1].subTitle.should.be.eql('targetUserIds 가 없어요');
                    res.body[1].type.should.be.eql('ONLINE');
                    res.body[1].typeTags.length.should.be.eql(2);
                    res.body[1].typeTags[0].should.be.eql('1:1');
                    res.body[1].typeTags[1].should.be.eql('인터뷰');
                    res.body[1].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[1].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[1].actionType.should.be.eql('link');
                    res.body[1].action.should.be.eql('https://www.google.com');
                    res.body[1].isOpened.should.be.eql(true);
                    res.body[1].isCompleted.should.be.eql(false);
                    should.not.exist(res.body[1].targetUserIds);
                    should.not.exist(res.body[1].completedUserIds);

                    res.body[2].title.should.be.eql('타겟팅 된 테스트');
                    res.body[2].subTitle.should.be.eql('적합한 테스터는 너야너 너야너');
                    res.body[2].type.should.be.eql('ONLINE');
                    res.body[2].typeTags.length.should.be.eql(2);
                    res.body[2].typeTags[0].should.be.eql('1:1');
                    res.body[2].typeTags[1].should.be.eql('인터뷰');
                    res.body[2].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[2].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[2].actionType.should.be.eql('link');
                    res.body[2].action.should.be.eql('https://www.google.com');
                    res.body[2].isOpened.should.be.eql(true);
                    res.body[2].isCompleted.should.be.eql(false);
                    should.not.exist(res.body[2].targetUserIds);
                    should.not.exist(res.body[2].completedUserIds);

                    done();
                }).catch(err => done(err));
        });

        it('오픈되지 않은 요청 건도 조회한다', done => {
            sandbox.useFakeTimers(new Date("2018-11-01T02:30:00.000Z").getTime());
            request.get('/beta-tests')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.sort((a, b) => a.title > b.title ? 1 : -1);

                    res.body.length.should.be.eql(3);

                    res.body[0].title.should.be.eql('이미 참여한 테스트');
                    res.body[0].subTitle.should.be.eql('참여했다');
                    res.body[0].type.should.be.eql('ONLINE');
                    res.body[0].typeTags.length.should.be.eql(2);
                    res.body[0].typeTags[0].should.be.eql('1:1');
                    res.body[0].typeTags[1].should.be.eql('인터뷰');
                    res.body[0].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[0].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[0].actionType.should.be.eql('link');
                    res.body[0].action.should.be.eql('https://www.google.com');
                    res.body[0].isOpened.should.be.eql(false);
                    res.body[0].isCompleted.should.be.eql(true);

                    res.body[1].title.should.be.eql('전체 유저 대상 테스트');
                    res.body[1].subTitle.should.be.eql('targetUserIds 가 없어요');
                    res.body[1].type.should.be.eql('ONLINE');
                    res.body[1].typeTags.length.should.be.eql(2);
                    res.body[1].typeTags[0].should.be.eql('1:1');
                    res.body[1].typeTags[1].should.be.eql('인터뷰');
                    res.body[1].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[1].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[1].actionType.should.be.eql('link');
                    res.body[1].action.should.be.eql('https://www.google.com');
                    res.body[1].isOpened.should.be.eql(false);
                    res.body[1].isCompleted.should.be.eql(false);
                    should.not.exist(res.body[1].targetUserIds);
                    should.not.exist(res.body[1].completedUserIds);

                    res.body[2].title.should.be.eql('타겟팅 된 테스트');
                    res.body[2].subTitle.should.be.eql('적합한 테스터는 너야너 너야너');
                    res.body[2].type.should.be.eql('ONLINE');
                    res.body[2].typeTags.length.should.be.eql(2);
                    res.body[2].typeTags[0].should.be.eql('1:1');
                    res.body[2].typeTags[1].should.be.eql('인터뷰');
                    res.body[2].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[2].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[2].actionType.should.be.eql('link');
                    res.body[2].action.should.be.eql('https://www.google.com');
                    res.body[2].isOpened.should.be.eql(false);
                    res.body[2].isCompleted.should.be.eql(false);
                    should.not.exist(res.body[2].targetUserIds);
                    should.not.exist(res.body[2].completedUserIds);

                    done();
                }).catch(err => done(err));
        });

        it('마감기간이 지난 요청 건은 조회하지 않는다', done => {
            sandbox.useFakeTimers(new Date("2019-01-30T02:30:00.000Z").getTime());

            request.get('/beta-tests')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(0);
                    done();
                }).catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        });
    });

    describe('POST /beta-tests/:id/complete', () => {
        let stubAxiosPost;

        beforeEach(() => {
            stubAxiosPost = sandbox.stub(axios, 'post').returns(Promise.resolve());
        });

        // 정상
        it('요청한 유저를 완료 리스트에 추가한다', done => {
            request.post('/beta-tests/1/complete')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => BetaTests.findOne({id: 1}))
                .then(res => {
                    res.completedUserIds.length.should.be.eql(1);
                    res.completedUserIds[0].should.be.eql(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        it('요청한 유저에게 완료 노티를 보낸다', done => {
            request.post('/beta-tests/1/complete')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => {
                    const expectUrl = 'https://fcm.googleapis.com/fcm/send';

                    const expectBody = {
                        data: {
                            channel: 'channel_betatest',
                            subTitle: '멋져요! 다음 테스트가 도착하면 다시 알려드릴게요.',
                            title: '참여하신 테스트가 완료처리 되었어요!👏'
                        },
                        to: 'test_user_registration_token'
                    };

                    const expectHeader = {
                        headers: {
                            Authorization: 'key=' + config.notiApiKey,
                            'Content-Type' : 'application/json'
                        }
                    };

                    sinon.assert.calledWith(stubAxiosPost, expectUrl, expectBody, expectHeader);

                    done();
                }).catch(err => done(err));
        });

        // 예외
        it('요청한 유저가 이미 완료한 경우에는 완료 리스트에 추가하지 않는다', done => {
            request.post('/beta-tests/5/complete')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => BetaTests.findOne({id: 5}))
                .then(res => {
                    console.log(res);
                    res.completedUserIds.length.should.be.eql(1);
                    res.completedUserIds[0].should.be.eql(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        it('요청한 유저가 이미 완료한 경우에는 완료 노티를 보내지 않는다', done => {
            request.post('/beta-tests/5/complete')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => BetaTests.findOne({id: 5}))
                .then(() => {
                    sinon.assert.notCalled(stubAxiosPost);
                    done();
                }).catch(err => done(err));
        });

        it('요청한 유저정보가 유효한 이메일로 접수되지 않은 경우 403 에러를 반환한다', done => {
            request.post('/beta-tests/1/complete')
                .set('x-access-token', 'InvalidAccessToken')
                .expect(403)
                .then(() => done())
                .catch(err => done(err));
        });

        afterEach(() => {
            stubAxiosPost.restore();
        });
    });

    afterEach(done => {
        BetaTests.remove({})
            .then(() => done())
            .catch(err => done(err));
    });

    after(done => {
        helper.commonAfter()
            .then(() => done())
            .catch(err => done(err));
    });
});
