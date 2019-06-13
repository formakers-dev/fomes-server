const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');
const axios = require('axios');
const should = chai.should();
const mongoose = require('mongoose');

const BetaTests = require('../models/betaTests');
const Configurations = require('../models/configurations');
const helper = require('./commonTestHelper');

describe('BetaTests', () => {
    const sandbox = sinon.createSandbox();
    const data = [
        {
            "_id" : mongoose.Types.ObjectId("111111111111111111111100"),
            "title" : "그룹1",
            "completedUserIds" : [],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            "tags" : [
                "설문"
            ],
            "apps" : [],
            "isGroup" : true,
            afterService: {
                epilogue: "epilogueURL",
                companySays: "짱이에요"
            }
        },
        {
            "_id" : mongoose.Types.ObjectId("222222222222222222222200"),
            "title" : "그룹2",
            "completedUserIds" : [],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2019-03-25'),
            "tags" : [
                "설문"
            ],
            "apps" : [],
            "isGroup" : true
        },
        {
            "_id" : mongoose.Types.ObjectId("111111111111111111111101"),
            groupId: mongoose.Types.ObjectId("111111111111111111111100"),
            id : 1,
            title : "전체 유저 대상 테스트",
            subTitle: "targetUserIds 가 없어요",
            tags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            overviewImageUrl: 'testImageUrl1',
            reward: 'testReward1',
            requiredTime: 1000,
            amount: '1가지 시나리오',
        }, {
            "_id" : mongoose.Types.ObjectId("111111111111111111111102"),
            groupId: mongoose.Types.ObjectId("111111111111111111111100"),
            id : 2,
            title : "타겟팅 된 테스트",
            subTitle: "적합한 테스터는 너야너 너야너",
            tags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            targetUserIds: [config.testUser.userId, "anotherUserId"],
            overviewImageUrl: 'testImageUrl2',
            reward: 'testReward2',
            requiredTime: 2000,
            amount: '2가지 시나리오',
        }, {
            "_id" : mongoose.Types.ObjectId("111111111111111111111103"),
            groupId: mongoose.Types.ObjectId("111111111111111111111100"),
            id : 3,
            title : "타겟팅 되지 않은 테스트",
            subTitle: "응 탈락",
            tags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            targetUserIds: ['anotherUserId'],
            overviewImageUrl: 'testImageUrl3',
            reward: 'testReward3',
            requiredTime: 3000,
            amount: '3가지 시나리오',
        }, {
            "_id" : mongoose.Types.ObjectId("222222222222222222222201"),
            groupId: mongoose.Types.ObjectId("222222222222222222222200"),
            id : 4,
            title : "아무도 타겟팅 되지 않은 테스트",
            subTitle: "응 모두 탈락",
            tags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            targetUserIds: [],
            overviewImageUrl: 'testImageUrl4',
            reward: 'testReward4',
            requiredTime: 4000,
            amount: '4가지 시나리오',
        },  {
            "_id" : mongoose.Types.ObjectId("222222222222222222222202"),
            groupId: mongoose.Types.ObjectId("222222222222222222222200"),
            id : 5,
            title : "이미 참여한 테스트",
            subTitle: "참여했다",
            tags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-31'),
            actionType: 'link',
            action: 'https://www.google.com',
            completedUserIds: [config.testUser.userId],
            overviewImageUrl: 'testImageUrl5',
            reward: 'testReward5',
            requiredTime: 5000,
            amount: '5가지 시나리오',
        },  {
            "_id" : mongoose.Types.ObjectId("333333333333333333333301"),
            groupId: mongoose.Types.ObjectId("333333333333333333333300"),
            id : 6,
            title : "종료된 테스트",
            subTitle: "참여했다",
            tags: ['1:1', "인터뷰"],
            openDate: new Date('2018-12-26'),
            closeDate: new Date('2018-12-27'),
            actionType: 'link',
            action: 'https://www.google.com',
            completedUserIds: [config.testUser.userId],
            overviewImageUrl: 'testImageUrl6',
            reward: 'testReward6',
            requiredTime: 6000,
            amount: '6가지 시나리오',
            isGroup : true,
        }
    ];

    before(done => {
        helper.commonBefore()
            .then(() => Configurations.create({
                notificationMessage : {
                    betaTest : {
                        completeTitle : '참여하신 테스트가 완료처리 되었어요!👏',
                        completeSubTitle : '멋져요! [:TITLE]에 성공적으로 참여하셨습니다.',
                    }
                }
            }))
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
                    res.body[0].tags.length.should.be.eql(2);
                    res.body[0].tags[0].should.be.eql('1:1');
                    res.body[0].tags[1].should.be.eql('인터뷰');
                    res.body[0].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[0].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[0].actionType.should.be.eql('link');
                    res.body[0].action.should.be.eql('https://www.google.com');
                    res.body[0].overviewImageUrl.should.be.eql('testImageUrl5');
                    res.body[0].reward.should.be.eql('testReward5');
                    res.body[0].requiredTime.should.be.eql(5000);
                    res.body[0].amount.should.be.eql('5가지 시나리오');
                    res.body[0].isOpened.should.be.eql(true);
                    res.body[0].isCompleted.should.be.eql(true);
                    res.body[0].currentDate.should.be.eql('2018-12-28T02:30:00.000Z');

                    res.body[1].title.should.be.eql('전체 유저 대상 테스트');
                    res.body[1].subTitle.should.be.eql('targetUserIds 가 없어요');
                    res.body[1].tags.length.should.be.eql(2);
                    res.body[1].tags[0].should.be.eql('1:1');
                    res.body[1].tags[1].should.be.eql('인터뷰');
                    res.body[1].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[1].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[1].actionType.should.be.eql('link');
                    res.body[1].action.should.be.eql('https://www.google.com');
                    res.body[1].overviewImageUrl.should.be.eql('testImageUrl1');
                    res.body[1].reward.should.be.eql('testReward1');
                    res.body[1].requiredTime.should.be.eql(1000);
                    res.body[1].amount.should.be.eql('1가지 시나리오');
                    res.body[1].isOpened.should.be.eql(true);
                    res.body[1].isCompleted.should.be.eql(false);
                    should.not.exist(res.body[1].targetUserIds);
                    should.not.exist(res.body[1].completedUserIds);
                    res.body[1].currentDate.should.be.eql('2018-12-28T02:30:00.000Z');

                    res.body[2].title.should.be.eql('타겟팅 된 테스트');
                    res.body[2].subTitle.should.be.eql('적합한 테스터는 너야너 너야너');
                    res.body[2].tags.length.should.be.eql(2);
                    res.body[2].tags[0].should.be.eql('1:1');
                    res.body[2].tags[1].should.be.eql('인터뷰');
                    res.body[2].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[2].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[2].actionType.should.be.eql('link');
                    res.body[2].action.should.be.eql('https://www.google.com');
                    res.body[2].overviewImageUrl.should.be.eql('testImageUrl2');
                    res.body[2].reward.should.be.eql('testReward2');
                    res.body[2].requiredTime.should.be.eql(2000);
                    res.body[2].amount.should.be.eql('2가지 시나리오');
                    res.body[2].isOpened.should.be.eql(true);
                    res.body[2].isCompleted.should.be.eql(false);
                    should.not.exist(res.body[2].targetUserIds);
                    should.not.exist(res.body[2].completedUserIds);
                    res.body[2].currentDate.should.be.eql('2018-12-28T02:30:00.000Z');

                    done();
                }).catch(err => done(err));
        });

        it('마감기간이 지났고 그룹의 마감기간이 지나지 않은 요청 건과' +
            ' 마감시간이 지난 그룹을 조회한다', done => {
            sandbox.useFakeTimers(new Date("2019-01-30T02:30:00.000Z").getTime());

            request.get('/beta-tests')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.sort((a, b) => a.title > b.title ? 1 : -1);

                    console.log(res.body);

                    res.body.length.should.be.eql(2);

                    // 마감시간이 지났고 그룹의 마감시간이 지난 요청 건은 조회하지 않는다
                    // 그룹1 은 뜨고....
                    // 그룹1의 아이템들은 안뜨고...........
                    res.body[0].isGroup.should.be.eql(true);
                    res.body[0].title.should.be.eql('그룹1');
                    res.body[0].tags.length.should.be.eql(1);
                    res.body[0].tags[0].should.be.eql('설문');
                    res.body[0].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[0].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    should.not.exist(res.body[0].targetUserIds);
                    res.body[0].isOpened.should.be.eql(false);
                    res.body[0].isCompleted.should.be.eql(false);
                    res.body[0].currentDate.should.be.eql('2019-01-30T02:30:00.000Z');
                    res.body[0].afterService.epilogue.should.be.eql('epilogueURL');
                    res.body[0].afterService.companySays.should.be.eql('짱이에요');

                    // 아이템들은 마감이됐는데 그룹은 안되었어
                    // 그룹2 는 안뜨고...........
                    // 그룹2의 아이템들은 뜬다...............
                    res.body[1].title.should.be.eql('이미 참여한 테스트');
                    res.body[1].subTitle.should.be.eql('참여했다');
                    res.body[1].tags.length.should.be.eql(2);
                    res.body[1].tags[0].should.be.eql('1:1');
                    res.body[1].tags[1].should.be.eql('인터뷰');
                    res.body[1].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[1].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[1].actionType.should.be.eql('link');
                    res.body[1].action.should.be.eql('https://www.google.com');
                    res.body[1].overviewImageUrl.should.be.eql('testImageUrl5');
                    res.body[1].reward.should.be.eql('testReward5');
                    res.body[1].requiredTime.should.be.eql(5000);
                    res.body[1].amount.should.be.eql('5가지 시나리오');
                    res.body[1].isOpened.should.be.eql(false);
                    res.body[1].isCompleted.should.be.eql(true);
                    res.body[1].currentDate.should.be.eql('2019-01-30T02:30:00.000Z');

                    done();
                }).catch(err => done(err));
        });

        it('오픈되지 않은 요청 건은 조회하지 않는다', done => {
            sandbox.useFakeTimers(new Date("2018-11-01T02:30:00.000Z").getTime());
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
                            title: '참여하신 테스트가 완료처리 되었어요!👏',
                            subTitle: '멋져요! [전체 유저 대상 테스트]에 성공적으로 참여하셨습니다.'
                        },
                        to: 'test_user_registration_token'
                    };

                    const expectHeader = {
                        headers: {
                            Authorization: 'key=testNotiApiKey',
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

    describe('POST /beta-tests/target-user', () => {
        let stubAxiosPost;

        beforeEach(() => {
            stubAxiosPost = sandbox.stub(axios, 'post').returns(Promise.resolve());
        });

        // 정상
        it('요청한 유저를 해당 베타테스트의 타겟 유저 리스트에 추가한다', done => {
            request.post('/beta-tests/target-user')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .send({betaTestIds: [1, 4]})
                .expect(200)
                .then(() => BetaTests.find({id: {$in: [1, 4]}}).sort({id: 1}))
                .then(betaTests => {
                    betaTests.length.should.be.eql(2);
                    betaTests[0].targetUserIds.length.should.be.eql(1);
                    betaTests[0].targetUserIds[0].should.be.eql(config.testUser.userId);
                    betaTests[1].targetUserIds.length.should.be.eql(1);
                    betaTests[1].targetUserIds[0].should.be.eql(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        it('요청한 유저에게 전달받은 알림을 보낸다', done => {
            request.post('/beta-tests/target-user')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .send({
                    betaTestIds: [1, 4],
                    notificationData: {
                        channel: 'channel_betatest',
                        title: '참여하신 테스트가 완료처리 되었어요!👏',
                        subTitle: '멋져요! [전체 유저 대상 테스트]에 성공적으로 참여하셨습니다.'
                    }
                })
                .expect(200)
                .then(() => {
                    const expectedUrl = 'https://fcm.googleapis.com/fcm/send';

                    const expectedBody = {
                        data: {
                            channel: 'channel_betatest',
                            title: '참여하신 테스트가 완료처리 되었어요!👏',
                            subTitle: '멋져요! [전체 유저 대상 테스트]에 성공적으로 참여하셨습니다.'
                        },
                        to: 'test_user_registration_token'
                    };

                    const expectedHeader = {
                        headers: {
                            Authorization: 'key=testNotiApiKey',
                            'Content-Type' : 'application/json'
                        }
                    };

                    sinon.assert.calledWith(stubAxiosPost, expectedUrl, expectedBody, expectedHeader);

                    done();
                }).catch(err => done(err));
        });

        it('요청한 유저에게 notificationData가 전달되지 않은 경우, 알림을 보내지 않는다', done => {
            request.post('/beta-tests/target-user')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .send({betaTestIds: [1, 4]})
                .expect(200)
                .then(() => {
                    stubAxiosPost.called.should.be.eql(false);

                    done();
                }).catch(err => done(err));
        });

        // 예외
        it('요청한 유저가 이미 타겟 유저 리스트에 추가되어있는 경우, 추가하지 않는다.', done => {
            request.post('/beta-tests/target-user')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .send({betaTestIds: [1, 4]})
                .expect(200)
                .then(() => BetaTests.find({id: {$in: [1, 4]}}).sort({id: 1}))
                .then(betaTests => {
                    betaTests.length.should.be.eql(2);
                    betaTests[0].targetUserIds.length.should.be.eql(1);
                    betaTests[0].targetUserIds[0].should.be.eql(config.testUser.userId);
                    betaTests[1].targetUserIds.length.should.be.eql(1);
                    betaTests[1].targetUserIds[0].should.be.eql(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        it('요청한 유저정보가 유효한 이메일로 접수되지 않은 경우, 403 에러를 반환한다', done => {
            request.post('/beta-tests/target-user')
                .set('x-access-token', 'InvalidAccessToken')
                .send({betaTestIds: [1, 4]})
                .expect(403)
                .then(() => done())
                .catch(err => done(err));
        });

        // TODO: 일부 실패 케이스에 대한 논의 필요
        it('요청한 베타테스트 ID 중 하나라도 유효하지 않은 경우, 207 에러를 반환한다', done => {
            request.post('/beta-tests/target-user')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .send({betaTestIds: [1, 9999]})
                .expect(207)
                .then(() => done())
                .catch(err => done(err));
        });

       afterEach(() => {
            stubAxiosPost.restore();
        });
    });

    describe('GET /beta-tests/finished', () => {

        it('종료된 피드백 요청 목록을 조회한다', done => {
            sandbox.useFakeTimers(new Date("2018-12-28T02:30:00.000Z").getTime());

            request.get('/beta-tests/finished')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.sort((a, b) => a.title > b.title ? 1 : -1);

                    console.log(new Date());
                    console.log(res.body);

                    res.body.length.should.be.eql(1);

                    res.body[0].title.should.be.eql('종료된 테스트');
                    res.body[0].subTitle.should.be.eql('참여했다');
                    res.body[0].tags.length.should.be.eql(2);
                    res.body[0].tags[0].should.be.eql('1:1');
                    res.body[0].tags[1].should.be.eql('인터뷰');
                    res.body[0].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
                    res.body[0].closeDate.should.be.eql('2018-12-27T00:00:00.000Z');
                    res.body[0].actionType.should.be.eql('link');
                    res.body[0].action.should.be.eql('https://www.google.com');
                    res.body[0].overviewImageUrl.should.be.eql('testImageUrl6');
                    res.body[0].reward.should.be.eql('testReward6');
                    res.body[0].requiredTime.should.be.eql(6000);
                    res.body[0].amount.should.be.eql('6가지 시나리오');
                    res.body[0].isOpened.should.be.eql(false);
                    res.body[0].isCompleted.should.be.eql(true);
                    res.body[0].currentDate.should.be.eql('2018-12-28T02:30:00.000Z');

                    done();
                }).catch(err => done(err));
        });

        it('오픈되지 않은 요청 건은 조회하지 않는다', done => {
            sandbox.useFakeTimers(new Date("2018-11-01T02:30:00.000Z").getTime());
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

    afterEach(done => {
        BetaTests.remove({})
            .then(() => done())
            .catch(err => done(err));
    });

    after(done => {
        helper.commonAfter()
            .then(() => Configurations.remove({}))
            .then(() => done())
            .catch(err => done(err));
    });
});
