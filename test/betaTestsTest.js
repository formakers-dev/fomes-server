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
const data = require('./data/beta-tests');

describe('BetaTests', () => {
    const sandbox = sinon.createSandbox();

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

        it('오픈된 피드백 요청 목록을 조회한다', done => {
            sandbox.useFakeTimers(new Date("2019-06-25T02:30:00.000Z").getTime());

            request.get('/beta-tests')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.sort((a, b) => a.title > b.title ? 1 : -1);
                    console.error(res.body);

                    res.body.length.should.be.eql(5);

                    res.body[0]._id.should.be.eql("5c25e1e824196d19231fbed3");
                    res.body[0].overviewImageUrl.should.be.eql("https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");
                    res.body[0].title.should.be.eql("appbee0627 한테만 보이는 활성화된 테스트");
                    res.body[0].description.should.be.eql("targetUserIds에 추가해보았다");
                    res.body[0].tags.length.should.be.eql(1);
                    res.body[0].tags[0].should.be.eql("설문");
                    res.body[0].openDate.should.be.eql("2018-12-28T00:00:00.000Z");
                    res.body[0].closeDate.should.be.eql("2119-12-31T00:00:00.000Z");
                    should.not.exist(res.body[0].bugReport);
                    res.body[0].progressRate.should.be.eql(0);

                    res.body[1]._id.should.be.eql("5c7345f718500feddc24ca34");
                    res.body[1].overviewImageUrl.should.be.eql("https://i.imgur.com/5z0esWH.png");
                    res.body[1].title.should.be.eql("버그제보 & 리워드 없음");
                    res.body[1].description.should.be.eql("* 제보 기간 : 2/25(월) ~ 3/3(일)\n* 제보 방법 : 게임 플레이 시 발견되는 버그가 있을 때마다 이 카드를 통해 제보\n* 중요 버그 제보를 할 수록 테스트 영웅 수상의 가능성이 높아집니다!");
                    res.body[1].tags.length.should.be.eql(1);
                    res.body[1].tags[0].should.be.eql("버그제보");
                    res.body[1].openDate.should.be.eql("2019-02-25T00:00:00.000Z");
                    res.body[1].closeDate.should.be.eql("2119-03-03T14:59:00.000Z");
                    res.body[1].bugReport.url.should.be.eql("https://docs.google.com/forms/d/e/1FAIpQLSeApAn8oPp8mW6UT8RD1uMbKk_UvAiWBh5jwlxlyUUI4D2N1g/viewform?usp=pp_url&entry.455936817=");
                    res.body[1].progressRate.should.be.eql(100);

                    res.body[2]._id.should.be.eql("5ce51a069cb162da02b9f94d");
                    res.body[2].overviewImageUrl.should.be.eql("https://i.imgur.com/n2MaXzg.png");
                    res.body[2].title.should.be.eql("테스트 추가 신청하기 (버그제보 있음)");
                    res.body[2].description.should.be.eql("테스트 하고싶은 게임 추가신청을 할 수 있어여");
                    res.body[2].tags.length.should.be.eql(3);
                    res.body[2].tags[0].should.be.eql("설문fsagsgasdadddddj 아아아아 ㄴ나나나ㅏ");
                    res.body[2].tags[1].should.be.eql("태그다");
                    res.body[2].tags[2].should.be.eql("꿀잼");
                    res.body[2].openDate.should.be.eql("2019-03-11T00:00:00.000Z");
                    res.body[2].closeDate.should.be.eql("2119-12-31T14:59:50.000Z");
                    res.body[2].progressRate.should.be.eql(2/3*100);

                    res.body[3]._id.should.be.eql("5c25c77798d78f078d8ef3ba");
                    res.body[3].overviewImageUrl.should.be.eql("https://images.pexels.com/photos/669609/pexels-photo-669609.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&h=500&w=500");
                    res.body[3].title.should.be.eql("포메스 설문조사 입니다! 제목이 좀 길어요 깁니다요 길어요오 제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오");
                    res.body[3].description.should.be.eql("갑자기 분위기 설문조사! 포메스 앱에 대한 설문조사입니다 :-D");
                    res.body[3].tags.length.should.be.eql(1);
                    res.body[3].tags[0].should.be.eql("플레이");
                    res.body[3].openDate.should.be.eql("2018-12-28T00:00:00.000Z");
                    res.body[3].closeDate.should.be.eql("2119-12-31T00:00:00.000Z");
                    should.not.exist(res.body[3].bugReport);
                    res.body[3].progressRate.should.be.eql(0);

                    res.body[4]._id.should.be.eql("5c861f3f2917e70db5d2d536");
                    res.body[4].overviewImageUrl.should.be.eql("https://i.imgur.com/n2MaXzg.png");
                    res.body[4].title.should.be.eql("포메스 우체통");
                    res.body[4].description.should.be.eql("우체통임다");
                    res.body[4].tags.length.should.be.eql(0);
                    res.body[4].openDate.should.be.eql("2019-03-11T00:00:00.000Z");
                    res.body[4].closeDate.should.be.eql("2119-12-31T14:59:50.000Z");
                    res.body[4].progressRate.should.be.eql(0);

                    done();
                }).catch(err => done(err));
        });

        // TODO : 아래 경우의 수가 포함되지 않는 임시 릴리즈라서 주석처리 한거다....
        // TODO : V2.5 릴리즈때 이 경우의 수도 고려해야해....!!!!!!!!!!!
        // it('마감이 지난 그룹의 아이템은 조회되지 않는다. (마감이 지나지 않은 그룹의 아이템은 조회된다)', done => {
        //     sandbox.useFakeTimers(new Date("2019-01-30T02:30:00.000Z").getTime());
        //
        //     request.get('/beta-tests')
        //         .set('x-access-token', config.appbeeToken.valid)
        //         .expect(200)
        //         .then(res => {
        //             console.log(res.body);
        //             res.body.length.should.be.eql(1);
        //
        //             res.body[0].title.should.be.eql('이미 참여한 테스트');
        //             res.body[0].subTitle.should.be.eql('참여했다');
        //             res.body[0].tags.length.should.be.eql(2);
        //             res.body[0].tags[0].should.be.eql('1:1');
        //             res.body[0].tags[1].should.be.eql('인터뷰');
        //             res.body[0].openDate.should.be.eql('2018-12-26T00:00:00.000Z');
        //             res.body[0].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
        //             res.body[0].actionType.should.be.eql('link');
        //             res.body[0].action.should.be.eql('https://www.google.com');
        //             res.body[0].overviewImageUrl.should.be.eql('testImageUrl5');
        //             res.body[0].reward.should.be.eql('testReward5');
        //             res.body[0].requiredTime.should.be.eql(5000);
        //             res.body[0].amount.should.be.eql('5가지 시나리오');
        //             res.body[0].isOpened.should.be.eql(false);
        //             res.body[0].isCompleted.should.be.eql(true);
        //             res.body[0].currentDate.should.be.eql('2019-01-30T02:30:00.000Z');
        //
        //             done();
        //         }).catch(err => done(err));
        // });

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
            sandbox.useFakeTimers(new Date("2019-06-30T02:30:00.000Z").getTime());

            request.get('/beta-tests/finished')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.sort((a, b) => a.title > b.title ? 1 : -1);

                    console.log(new Date());
                    console.log(res.body);

                    res.body.length.should.be.eql(3);

                    res.body[0].title.should.be.eql('1.전체 유저 대상이고 내가 완료하지 않은 테스트 그룹');
                    res.body[0].iconImageUrl.should.be.eql('testIconImageUrl1');
                    res.body[0].closeDate.should.be.eql('2018-12-31T00:00:00.000Z');
                    res.body[0].tags.length.should.be.eql(1);
                    res.body[0].tags[0].should.be.eql('설문');
                    res.body[0].isOpened.should.be.eql(false);
                    res.body[0].isCompleted.should.be.eql(false);
                    res.body[0].afterService.awards.should.be.eql('awards1');
                    res.body[0].afterService.epilogue.should.be.eql('epilogueURL1');
                    res.body[0].afterService.companySays.should.be.eql('짱이에요');

                    res.body[1].title.should.be.eql('2.타게팅 되었고 내가 완로한 테스트 그룹');
                    res.body[1].iconImageUrl.should.be.eql('testIconImageUrl2');
                    res.body[1].closeDate.should.be.eql('2019-03-25T00:00:00.000Z');
                    res.body[1].tags.length.should.be.eql(1);
                    res.body[1].tags[0].should.be.eql('설문');
                    res.body[1].isOpened.should.be.eql(false);
                    res.body[1].isCompleted.should.be.eql(true);
                    should.not.exist(res.body[1].afterService);

                    res.body[2].title.should.be.eql('3.타게팅 되었고 내가 완로하지 않은 테스트 그룹');
                    res.body[2].iconImageUrl.should.be.eql('testIconImageUrl3');
                    res.body[2].closeDate.should.be.eql('2019-03-25T00:00:00.000Z');
                    res.body[2].tags.length.should.be.eql(1);
                    res.body[2].tags[0].should.be.eql('설문');
                    res.body[2].isOpened.should.be.eql(false);
                    res.body[2].isCompleted.should.be.eql(false);
                    should.not.exist(res.body[2].afterService);

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
