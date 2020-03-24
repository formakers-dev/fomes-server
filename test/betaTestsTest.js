const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');
const axios = require('axios');
const should = chai.should();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const BetaTests = require('../models/betaTests');
const BetaTestParticipations = require('../models/betaTestParticipations');
const Configurations = require('../models/configurations').Configurations;
const AdminUsers = require('../models/configurations').AdminUsers;
const helper = require('./commonTestHelper');
const betatestData = require('./data/beta-tests');
const participationData = require('./data/participations');

describe('BetaTests', () => {
    const sandbox = sinon.createSandbox();

    before(done => {
        const configurationData = {
            minAppVersionCode: 2,
            excludeAnalysisPackageNames: ["com.kakao.talk", "com.line.talk"],
            betaTestProgressText: {
                ready: "Default! 밑져야 본전!",
                doing: "Default! 당신을 기다리고 있었어요!",
                done: "Default! 굿! 훌륭해요!"
            }
        };

        helper.commonBefore()
            .then(() => Configurations.create(configurationData))
            .then(() => done())
            .catch(err => done(err));
    });

    beforeEach(done => {
        AdminUsers.create([ { userId: "adminUser1" } ])
            .then(() => BetaTests.create(betatestData))
            .then(() => BetaTestParticipations.create(participationData))
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
                    res.body[0].coverImageUrl.should.be.eql("https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");
                    res.body[0].title.should.be.eql("appbee0627 한테만 보이는 활성화된 테스트");
                    res.body[0].description.should.be.eql("targetUserIds에 추가해보았다");
                    res.body[0].progressText.ready.should.be.eql("망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.");
                    res.body[0].progressText.doing.should.be.eql("아직 참여 진행중인데 끝내고 싶지 않니??? 얼른 끝내버리자아아앙 두줄두줄 두줄두줄");
                    res.body[0].progressText.done.should.be.eql("굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요.");
                    res.body[0].tags.length.should.be.eql(1);
                    res.body[0].tags[0].should.be.eql("설문");
                    res.body[0].openDate.should.be.eql("2018-12-28T00:00:00.000Z");
                    res.body[0].closeDate.should.be.eql("2119-12-31T00:00:00.000Z");
                    should.not.exist(res.body[0].bugReport);
                    res.body[0].completedItemCount.should.be.eql(0);
                    res.body[0].totalItemCount.should.be.eql(1);

                    res.body[1]._id.should.be.eql("5c7345f718500feddc24ca34");
                    res.body[1].coverImageUrl.should.be.eql("https://i.imgur.com/5z0esWH.png");
                    res.body[1].title.should.be.eql("버그제보 & 리워드 없음 (ProgressText null)");
                    res.body[1].description.should.be.eql("* 제보 기간 : 2/25(월) ~ 3/3(일)\n* 제보 방법 : 게임 플레이 시 발견되는 버그가 있을 때마다 이 카드를 통해 제보\n* 중요 버그 제보를 할 수록 테스트 영웅 수상의 가능성이 높아집니다!");
                    res.body[1].progressText.ready.should.be.eql("Default! 밑져야 본전!");
                    res.body[1].progressText.doing.should.be.eql("Default! 당신을 기다리고 있었어요!");
                    res.body[1].progressText.done.should.be.eql("Default! 굿! 훌륭해요!");
                    res.body[1].tags.length.should.be.eql(1);
                    res.body[1].tags[0].should.be.eql("버그제보");
                    res.body[1].openDate.should.be.eql("2019-02-25T00:00:00.000Z");
                    res.body[1].closeDate.should.be.eql("2119-03-03T14:59:00.000Z");
                    res.body[1].bugReport.url.should.be.eql("https://docs.google.com/forms/d/e/1FAIpQLSeApAn8oPp8mW6UT8RD1uMbKk_UvAiWBh5jwlxlyUUI4D2N1g/viewform?usp=pp_url&entry.455936817=");
                    res.body[1].completedItemCount.should.be.eql(3);
                    res.body[1].totalItemCount.should.be.eql(3);

                    res.body[2]._id.should.be.eql("5ce51a069cb162da02b9f94d");
                    res.body[2].coverImageUrl.should.be.eql("https://i.imgur.com/n2MaXzg.png");
                    res.body[2].title.should.be.eql("테스트 추가 신청하기 (버그제보 있음)");
                    res.body[2].description.should.be.eql("테스트 하고싶은 게임 추가신청을 할 수 있어여");
                    res.body[2].plan.should.be.eql("standard");
                    res.body[2].progressText.ready.should.be.eql("망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.");
                    res.body[2].progressText.doing.should.be.eql("당신을 기다리고 있었어요! 이어서 참여해볼까요?");
                    res.body[2].progressText.done.should.be.eql("굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요.");
                    res.body[2].tags.length.should.be.eql(3);
                    res.body[2].tags[0].should.be.eql("설문fsagsgasdadddddj 아아아아 ㄴ나나나ㅏ");
                    res.body[2].tags[1].should.be.eql("태그다");
                    res.body[2].tags[2].should.be.eql("꿀잼");
                    res.body[2].openDate.should.be.eql("2019-03-11T00:00:00.000Z");
                    res.body[2].closeDate.should.be.eql("2119-12-31T14:59:50.000Z");
                    res.body[2].completedItemCount.should.be.eql(2);
                    res.body[2].totalItemCount.should.be.eql(4);

                    res.body[3]._id.should.be.eql("5c25c77798d78f078d8ef3ba");
                    res.body[3].coverImageUrl.should.be.eql("https://images.pexels.com/photos/669609/pexels-photo-669609.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&h=500&w=500");
                    res.body[3].title.should.be.eql("포메스 설문조사 입니다! 제목이 좀 길어요 깁니다요 길어요오 제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오");
                    res.body[3].description.should.be.eql("갑자기 분위기 설문조사! 포메스 앱에 대한 설문조사입니다 :-D");
                    res.body[3].progressText.ready.should.be.eql("밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.");
                    res.body[3].progressText.doing.should.be.eql("당신을 기다리고 있었어요! 이어서 참여해볼까요?");
                    res.body[3].progressText.done.should.be.eql("짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요.");
                    res.body[3].tags.length.should.be.eql(1);
                    res.body[3].tags[0].should.be.eql("플레이");
                    res.body[3].openDate.should.be.eql("2018-12-28T00:00:00.000Z");
                    res.body[3].closeDate.should.be.eql("2119-12-31T00:00:00.000Z");
                    should.not.exist(res.body[3].bugReport);
                    res.body[3].completedItemCount.should.be.eql(2);
                    res.body[3].totalItemCount.should.be.eql(5);

                    res.body[4]._id.should.be.eql("5c861f3f2917e70db5d2d536");
                    res.body[4].coverImageUrl.should.be.eql("https://i.imgur.com/n2MaXzg.png");
                    res.body[4].title.should.be.eql("포메스 우체통 (ProgressText없음)");
                    res.body[4].description.should.be.eql("우체통임다");
                    res.body[4].progressText.ready.should.be.eql("Default! 밑져야 본전!");
                    res.body[4].progressText.doing.should.be.eql("Default! 당신을 기다리고 있었어요!");
                    res.body[4].progressText.done.should.be.eql("Default! 굿! 훌륭해요!");
                    // TODO: 진행중 테스트 조회 임시코드 제거시 주석 제거
                    // res.body[4].tags.length.should.be.eql(0);
                    res.body[4].openDate.should.be.eql("2019-03-11T00:00:00.000Z");
                    res.body[4].closeDate.should.be.eql("2119-12-31T14:59:50.000Z");
                    res.body[4].completedItemCount.should.be.eql(0);
                    res.body[4].totalItemCount.should.be.eql(1);

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

        describe('요청한 유저가 관리자 이면', () => {
            beforeEach(done => {
                const newAdmin = new AdminUsers({
                    userId: config.testUser.userId,
                });
                newAdmin.save()
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("상태가 test인 건도 조회한다", done => {
                sandbox.useFakeTimers(new Date("2019-06-25T02:30:00.000Z").getTime());

                request.get('/beta-tests')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(200)
                    .then(res => {
                        res.body.sort((a, b) => a.title > b.title ? 1 : -1);
                        console.error(res.body);

                        res.body.length.should.be.eql(6);

                        res.body[0]._id.should.be.eql("5c25e1e824196d19231fbed3");
                        res.body[0].coverImageUrl.should.be.eql("https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");
                        res.body[0].title.should.be.eql("appbee0627 한테만 보이는 활성화된 테스트");
                        res.body[0].description.should.be.eql("targetUserIds에 추가해보았다");
                        res.body[0].openDate.should.be.eql("2018-12-28T00:00:00.000Z");
                        res.body[0].closeDate.should.be.eql("2119-12-31T00:00:00.000Z");

                        res.body[1]._id.should.be.eql("1c861f3f2917e73db5d2d536");
                        res.body[1].coverImageUrl.should.be.eql("https://i.imgur.com/n2MaXzg.png");
                        res.body[1].title.should.be.eql("검색되지 말아야 하는 미션");
                        res.body[1].description.should.be.eql("테스트 성 이니까");
                        res.body[1].openDate.should.be.eql("2019-03-11T00:00:00.000Z");
                        res.body[1].closeDate.should.be.eql("2119-12-31T14:59:50.000Z");

                        res.body[2]._id.should.be.eql("5c7345f718500feddc24ca34");
                        res.body[2].coverImageUrl.should.be.eql("https://i.imgur.com/5z0esWH.png");
                        res.body[2].title.should.be.eql("버그제보 & 리워드 없음 (ProgressText null)");
                        res.body[2].description.should.be.eql("* 제보 기간 : 2/25(월) ~ 3/3(일)\n* 제보 방법 : 게임 플레이 시 발견되는 버그가 있을 때마다 이 카드를 통해 제보\n* 중요 버그 제보를 할 수록 테스트 영웅 수상의 가능성이 높아집니다!");
                        res.body[2].openDate.should.be.eql("2019-02-25T00:00:00.000Z");
                        res.body[2].closeDate.should.be.eql("2119-03-03T14:59:00.000Z");

                        res.body[3]._id.should.be.eql("5ce51a069cb162da02b9f94d");
                        res.body[3].coverImageUrl.should.be.eql("https://i.imgur.com/n2MaXzg.png");
                        res.body[3].title.should.be.eql("테스트 추가 신청하기 (버그제보 있음)");
                        res.body[3].description.should.be.eql("테스트 하고싶은 게임 추가신청을 할 수 있어여");
                        res.body[3].plan.should.be.eql("standard");
                        res.body[3].openDate.should.be.eql("2019-03-11T00:00:00.000Z");
                        res.body[3].closeDate.should.be.eql("2119-12-31T14:59:50.000Z");

                        res.body[4]._id.should.be.eql("5c25c77798d78f078d8ef3ba");
                        res.body[4].coverImageUrl.should.be.eql("https://images.pexels.com/photos/669609/pexels-photo-669609.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&h=500&w=500");
                        res.body[4].title.should.be.eql("포메스 설문조사 입니다! 제목이 좀 길어요 깁니다요 길어요오 제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오");
                        res.body[4].description.should.be.eql("갑자기 분위기 설문조사! 포메스 앱에 대한 설문조사입니다 :-D");
                        res.body[4].openDate.should.be.eql("2018-12-28T00:00:00.000Z");
                        res.body[4].closeDate.should.be.eql("2119-12-31T00:00:00.000Z");

                        res.body[5]._id.should.be.eql("5c861f3f2917e70db5d2d536");
                        res.body[5].coverImageUrl.should.be.eql("https://i.imgur.com/n2MaXzg.png");
                        res.body[5].title.should.be.eql("포메스 우체통 (ProgressText없음)");
                        res.body[5].description.should.be.eql("우체통임다");
                        res.body[5].openDate.should.be.eql("2019-03-11T00:00:00.000Z");
                        res.body[5].closeDate.should.be.eql("2119-12-31T14:59:50.000Z");

                        done();
                    }).catch(err => done(err));
            });

            afterEach(done => {
                AdminUsers.remove({userId: config.testUser.userId})
                    .then(() => done())
                    .catch(err => done(err));
            });
        });

        afterEach(() => {
            sandbox.restore();
        });
    });

    describe('GET /beta-tests/:id/progress', () => {

        it('테스트존 리스트에 나타날 특정 테스트의 진행 상태를 요청한다', done => {
            sandbox.useFakeTimers(new Date("2019-06-25T02:30:00.000Z").getTime());

            request.get('/beta-tests/5c25e1e824196d19231fbed3/progress')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    console.error(res.body);

                    res.body._id.should.be.eql("5c25e1e824196d19231fbed3");
                    res.body.completedItemCount.should.be.eql(0);
                    res.body.totalItemCount.should.be.eql(1);

                    done();
                }).catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        });
    });

    describe("POST /beta-tests/:id/attend", () => {
        beforeEach(() => {
            sandbox.useFakeTimers(new Date("2020-03-20T02:30:00.000Z").getTime());
        });

        // 정상
        it("요청한 유저의 베타테스트 참여 기록을 저장한다", done => {
            request.post('/beta-tests/111111111111111111111111/attend')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(() => BetaTestParticipations.findOne({
                    "userId" : config.testUser.userId,
                    "betaTestId" : ObjectId("111111111111111111111111"),
                    "missionId" : { $exists: false },
                }))
                .then(res => {
                    res.userId.should.be.eql(config.testUser.userId);
                    res.betaTestId.should.be.eql(ObjectId("111111111111111111111111"));
                    res.date.should.be.eql(new Date("2020-03-20T02:30:00.000Z"));
                    should.not.exist(res.missionId);

                    done();
                })
                .catch(err => done(err));
        });

        // 예외
        it('요청한 유저가 이미 완료한 경우에는 참여정보를 업데이트하지않고 409를 리턴한다', done => {
            request.post('/beta-tests/5d01b1f6db7d04bc2d04345c/attend')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(409)
                .then(() => BetaTestParticipations.findOne({
                    "userId": config.testUser.userId,
                    "betaTestId" : ObjectId("5d01b1f6db7d04bc2d04345c"),
                    "missionId" : { $exists: false },
                }))
                .then(participation => {
                    participation.userId.should.be.eql(config.testUser.userId);
                    participation.betaTestId.should.be.eql(ObjectId("5d01b1f6db7d04bc2d04345c"));
                    participation.date.should.be.eql(new Date("2020-03-17"));
                    should.not.exist(participation.missionId);

                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        })
    });

    describe('POST /beta-tests/:id/missions/:missionId/complete', () => {
        let stubAxiosPost;

        beforeEach(() => {
            stubAxiosPost = sandbox.stub(axios, 'post').returns(Promise.resolve());
            sandbox.useFakeTimers(new Date("2020-03-20T02:30:00.000Z").getTime());
        });

        // 정상
        it('요청한 유저의 미션 참여 기록을 저장한다', done => {
            request.post('/beta-tests/5c25c77798d78f078d8ef3ba/missions/5d1d74d6d638af0bb86b0f70/complete?from=external_script')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => BetaTestParticipations.findOne({
                    "userId": config.testUser.userId,
                    "betaTestId" : ObjectId("5c25c77798d78f078d8ef3ba"),
                    "missionId" : ObjectId("5d1d74d6d638af0bb86b0f70"),
                }))
                .then(res => {
                    res.userId.should.be.eql(config.testUser.userId);
                    res.betaTestId.should.be.eql(ObjectId("5c25c77798d78f078d8ef3ba"));
                    res.missionId.should.be.eql(ObjectId("5d1d74d6d638af0bb86b0f70"));
                    res.date.should.be.eql(new Date("2020-03-20T02:30:00.000Z"));

                    done();
                })
                .catch(err => done(err));
        });


        it('요청한 유저에게 전달받은 알림을 보낸다', done => {
            request.post('/beta-tests/5c25c77798d78f078d8ef3ba/missions/5d1d74d6d638af0bb86b0f70/complete?from=external_script')
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

        // 예외
        it('요청한 유저가 베타테스트 참여 신청이 되지 않은 경우에는 412를 리턴한다', done => {
            request.post('/beta-tests/111111111111111111111111/missions/111111111111111111111112/complete?from=external_script')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(428)
                .then(() => BetaTestParticipations.find({
                    "userId": config.testUser.userId,
                    "betaTestId" : ObjectId("111111111111111111111111")
                }))
                .then(participations => {
                    participations.length.should.be.eql(0);

                    done();
                })
                .catch(err => done(err));
        });

        it('요청한 유저가 이미 완료한 경우에는 참여정보를 업데이트하지않고 409를 리턴한다', done => {
            request.post('/beta-tests/5d01b1f6db7d04bc2d04345c/missions/5d199ac3839927107f4bb94e/complete?from=external_script')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(409)
                .then(() => BetaTestParticipations.findOne({
                    "userId": config.testUser.userId,
                    "betaTestId" : ObjectId("5d01b1f6db7d04bc2d04345c"),
                    "missionId" : ObjectId("5d199ac3839927107f4bb94e"),
                }))
                .then(participation => {
                    participation.userId.should.be.eql(config.testUser.userId);
                    participation.betaTestId.should.be.eql(ObjectId("5d01b1f6db7d04bc2d04345c"));
                    participation.missionId.should.be.eql(ObjectId("5d199ac3839927107f4bb94e"));
                    participation.date.should.be.eql(new Date("2020-03-17"));

                    done();
                })
                .catch(err => done(err));
        });

        it('요청한 유저정보가 유효한 이메일로 접수되지 않은 경우 403 에러를 반환한다', done => {
            request.post('/beta-tests/1/missions/2/complete?from=external_script')
                .set('x-access-token', 'InvalidAccessToken')
                .expect(403)
                .then(() => done())
                .catch(err => done(err));
        });

        afterEach(() => {
            stubAxiosPost.restore();
            sandbox.restore();
        });
    });

    describe('POST /beta-tests/:id/complete', () => {
        let stubAxiosPost;

        beforeEach(() => {
            stubAxiosPost = sandbox.stub(axios, 'post').returns(Promise.resolve());
        });

        // 정상
        it('요청한 유저를 전달받은 ID에 해당하는 미션아이템의 완료 리스트에 추가한다', done => {
            request.post('/beta-tests/5d1d74d6d638af0bb86b0f70/complete?from=external_script')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => BetaTests.findOne({"missions.items._id": ObjectId("5d1d74d6d638af0bb86b0f70")}))
                .then(res => {
                    res.missions.sort((o1, o2) => o1.order - o2.order);
                    res.missions.forEach(mission => {
                        mission.items.sort((o1, o2) => o1.order - o2.order);
                    });

                    res.missions[0].items[0].completedUserIds.length.should.be.eql(1);
                    res.missions[0].items[0].completedUserIds.should.be.include("google115909938647516500511");

                    res.missions[0].items[1].completedUserIds.length.should.be.eql(3);
                    res.missions[0].items[1].completedUserIds.should.be.include("google115909938647516500511");
                    res.missions[0].items[1].completedUserIds.should.be.include("google115838807161306170827");
                    res.missions[0].items[1].completedUserIds.should.be.include(config.testUser.userId);

                    res.missions[1].items[0].completedUserIds.length.should.be.eql(2);
                    res.missions[1].items[0].completedUserIds.should.be.include("google115909938647516500511");
                    res.missions[1].items[0].completedUserIds.should.be.include(config.testUser.userId);

                    res.missions[1].items[2].completedUserIds.length.should.be.eql(1);
                    res.missions[1].items[2].completedUserIds.should.be.include("google115909938647516500511");

                    res.missions[1].items[1].completedUserIds.length.should.be.eql(2);
                    res.missions[1].items[1].completedUserIds.should.be.include(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });


        it('요청한 유저에게 전달받은 알림을 보낸다', done => {
            request.post('/beta-tests/5d19996f839927107f4bb941/complete?from=external_script')
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

        // 예외
        it('요청한 유저가 이미 완료한 경우에는 완료 리스트에 추가하지 않는다', done => {
            request.post('/beta-tests/5d199913839927107f4bb93f/complete?from=external_script')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => BetaTests.findOne({"missions.items._id": ObjectId("5d199913839927107f4bb93f")}))
                .then(res => {
                    res.missions.sort((o1, o2) => o1.order - o2.order);
                    res.missions.forEach(mission => {
                        mission.items.sort((o1, o2) => o1.order - o2.order);
                    });

                    console.log(res.missions[1].items[0]);
                    res.missions[1].items[0].completedUserIds.length.should.be.eql(2);
                    res.missions[1].items[0].completedUserIds.should.be.include(config.testUser.userId);
                    done();
                })
                .catch(err => done(err));
        });

        it('요청한 유저가 이미 완료한 경우에는 완료 노티를 보내지 않는다', done => {
            request.post('/beta-tests/5d199a0b839927107f4bb942/complete?from=external_script')
                .set('x-access-token', 'YXBwYmVlQGFwcGJlZS5jb20K')
                .expect(200)
                .then(() => BetaTests.findOne({"missions.items._id": ObjectId("5d199a0b839927107f4bb942")}))
                .then(() => {
                    sinon.assert.notCalled(stubAxiosPost);
                    done();
                }).catch(err => done(err));
        });

        it('요청한 유저정보가 유효한 이메일로 접수되지 않은 경우 403 에러를 반환한다', done => {
            request.post('/beta-tests/1/complete?from=external_script')
                .set('x-access-token', 'InvalidAccessToken')
                .expect(403)
                .then(() => done())
                .catch(err => done(err));
        });

        afterEach(() => {
            stubAxiosPost.restore();
        });
    });

    describe.skip('POST /beta-tests/target-user', () => {
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

                    console.error(res.body);

                    res.body.length.should.be.eql(5);

                    res.body[0]._id.should.be.eql("5d01b1f6db7d04bc2d04345c");
                    res.body[0].iconImageUrl.should.be.eql("https://i.imgur.com/oXFepuQ.jpg");
                    res.body[0].title.should.be.eql("[매드러너] 게임 테스트");
                    res.body[0].description.should.be.eql("");
                    res.body[0].tags.length.should.be.eql(1);
                    res.body[0].tags[0].should.be.eql("설문");
                    res.body[0].openDate.should.be.eql("2019-06-13T00:00:00.000Z");
                    res.body[0].closeDate.should.be.eql("2019-06-19T14:59:59.999Z");
                    should.not.exist(res.body[0].afterService);
                    res.body[0].completedItemCount.should.be.eql(2);
                    res.body[0].totalItemCount.should.be.eql(2);
                    res.body[0].missions.length.should.be.eql(1);
                    res.body[0].missions[0].item.isRecheckable.should.be.eql(true);
                    res.body[0].missions[0].item.title.should.be.eql("의견 작성");
                    res.body[0].missions[0].item.actionType.should.be.eql("link");
                    res.body[0].missions[0].item.action.should.be.eql("https://docs.google.com/forms/d/e/1FAIpQLSeRI99bYe7LUU0iQgVMKev6D4zyaW2E3zKx-Tp1tVW2Qzv0Cg/viewform?internal_web=true&usp=pp_url&entry.394653407=");

                    res.body[1]._id.should.be.eql("5c986adee1a6f20813ec464d");
                    res.body[1].iconImageUrl.should.be.eql("https://i.imgur.com/4A0jfFe.jpg");
                    res.body[1].title.should.be.eql("[메이헴의 유산] 게임 테스트 + 에필로그");
                    res.body[1].tags.length.should.be.eql(1);
                    res.body[1].tags[0].should.be.eql("설문");
                    res.body[1].openDate.should.be.eql("2019-03-21T15:00:00.000Z");
                    res.body[1].closeDate.should.be.eql("2019-03-23T00:00:00.000Z");
                    res.body[1].afterService.awards.should.be.eql("테스트 영웅 : 드래군핥짝 님\n테스트 요정 : 이브 외 9명");
                    res.body[1].afterService.epilogue.should.be.eql("http://www.naver.com");
                    res.body[1].afterService.companySays.should.be.eql("포메스 짱! 완전 짱! 대박! 완전! 완전! 두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄");
                    res.body[1].completedItemCount.should.be.eql(0);
                    res.body[1].totalItemCount.should.be.eql(1);

                    res.body[2]._id.should.be.eql("5c99d14fd122450cf08431ab");
                    res.body[2].iconImageUrl.should.be.eql("https://i.imgur.com/4oaQHWe.jpg");
                    res.body[2].title.should.be.eql("appbee0627이 참여하지 않은 그룹! 에필로그도 없음!");
                    res.body[2].tags.length.should.be.eql(1);
                    res.body[2].tags[0].should.be.eql("설문");
                    res.body[2].openDate.should.be.eql("2019-03-21T15:00:00.000Z");
                    res.body[2].closeDate.should.be.eql("2019-03-25T00:00:00.000Z");
                    should.not.exist(res.body[2].afterService);
                    res.body[2].completedItemCount.should.be.eql(0);
                    res.body[2].totalItemCount.should.be.eql(1);

                    res.body[3]._id.should.be.eql("5c989f0a2917e70db5d4fc2e");
                    res.body[3].iconImageUrl.should.be.eql("https://i.imgur.com/uSaMpey.jpg");
                    res.body[3].title.should.be.eql("appbee0627이 참여한 그룹! + 에필로그  길게길게길게길게길게길게길게길게길게길게길게길게길게길게길게");
                    res.body[3].tags.length.should.be.eql(1);
                    res.body[3].tags[0].should.be.eql("설문");
                    res.body[3].openDate.should.be.eql("2019-03-21T15:00:00.000Z");
                    res.body[3].closeDate.should.be.eql("2019-03-26T00:00:00.000Z");
                    res.body[3].afterService.awards.should.be.eql("포메스 팀 : 참가자 여러분 모두 저희의 챔피언❤️");
                    res.body[3].afterService.epilogue.should.be.eql("http://www.google.co.kr");
                    res.body[3].afterService.companySays.should.be.eql("게임사 가라사대, 너희가 나를 살찌웠노라.... 고맙노라.....");
                    res.body[3].completedItemCount.should.be.eql(1);
                    res.body[3].totalItemCount.should.be.eql(1);

                    res.body[4]._id.should.be.eql("5c99d101d122450cf08431aa");
                    res.body[4].iconImageUrl.should.be.eql("https://i.imgur.com/7886ojX.png");
                    res.body[4].title.should.be.eql("appbee0627이 참여한 그룹! 근데 에필로그가 아직 등록안됨!!!!");
                    res.body[4].tags.length.should.be.eql(1);
                    res.body[4].tags[0].should.be.eql("설문");
                    res.body[4].openDate.should.be.eql("2019-03-21T15:00:00.000Z");
                    res.body[4].closeDate.should.be.eql("2019-03-24T00:00:00.000Z");
                    should.not.exist(res.body[4].afterService);
                    res.body[4].completedItemCount.should.be.eql(1);
                    res.body[4].totalItemCount.should.be.eql(1);

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

    describe('GET /beta-tests/detail/:id', () => {

        it('요청된 테스트의 상세정보를 조회한다', done => {
            sandbox.useFakeTimers(new Date("2019-06-30T02:30:00.000Z").getTime());

            request.get('/beta-tests/detail/5ce51a069cb162da02b9f94d')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    console.error(res.body);

                    res.body._id.should.be.eql("5ce51a069cb162da02b9f94d");
                    res.body.title.should.be.eql("테스트 추가 신청하기 (버그제보 있음)");
                    res.body.description.should.be.eql("테스트 하고싶은 게임 추가신청을 할 수 있어여");
                    res.body.purpose.should.be.eql("테스트 목적이무니다");
                    res.body.coverImageUrl.should.be.eql('https://i.imgur.com/n2MaXzg.png');
                    res.body.iconImageUrl.should.be.eql('https://i.imgur.com/n2MaXzg.png');
                    res.body.openDate.should.be.eql('2019-03-11T00:00:00.000Z');
                    res.body.closeDate.should.be.eql('2119-12-31T14:59:50.000Z');
                    res.body.isAttended.should.be.eql(true);

                    res.body.missions.length.should.be.eql(4);
                    res.body.missions[0].order.should.be.eql(1);
                    res.body.missions[0].title.should.be.eql("베타테스트 추가 신청하기");
                    res.body.missions[0].description.should.be.eql("테스트를 신청하라!!!!\n테스트 하고 싶은 게임 골라라아아아아ㅏ아");
                    res.body.missions[0].descriptionImageUrl.should.be.eql('https://i.imgur.com/n2MaXzg.png');
                    res.body.missions[0].iconImageUrl.should.be.eql('https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png');
                    res.body.missions[0].item.order.should.be.eql(1);
                    res.body.missions[0].item.title.should.be.eql("신청하기");
                    res.body.missions[0].item.action.should.be.eql("https://docs.google.com/forms/d/e/1FAIpQLSdxI2s694nLTVk4i7RMkkrtr-K_0s7pSKfUnRusr7348nQpJg/viewform?usp=pp_url&entry.1042588232=");
                    res.body.missions[0].item.isCompleted.should.be.eql(true);
                    res.body.missions[0].item.isRepeatable.should.be.eql(true);
                    res.body.missions[0].item.isMandatory.should.be.eql(true);

                    res.body.missions[1].order.should.be.eql(2);
                    res.body.missions[1].title.should.be.eql("첫번째 미션!!!");
                    res.body.missions[1].description.should.be.eql("게임을 10분 이상 플레이하라!!!!!!!");
                    res.body.missions[1].descriptionImageUrl.should.be.eql('');
                    res.body.missions[1].iconImageUrl.should.be.eql('https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png');
                    res.body.missions[1].guide.should.be.eql('* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.');
                    res.body.missions[1].item.order.should.be.eql(1);
                    res.body.missions[1].item.title.should.be.eql("게임 플레이");
                    res.body.missions[1].item.action.should.be.eql("https://play.google.com/store/apps/details?id=com.frozax.tentsandtrees");
                    res.body.missions[1].item.postCondition.playTime.should.be.eql(600000);
                    res.body.missions[1].item.postCondition.packageName.should.be.eql("com.frozax.tentsandtrees");
                    res.body.missions[1].item.isCompleted.should.be.eql(false);

                    res.body.missions[2].order.should.be.eql(3);
                    res.body.missions[2].title.should.be.eql("두번째 미션!!!");
                    res.body.missions[2].description.should.be.eql("설문을 하라!!!!!!!!!!!");
                    res.body.missions[2].descriptionImageUrl.should.be.eql('');
                    res.body.missions[2].iconImageUrl.should.be.eql('https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png');
                    res.body.missions[2].guide.should.be.eql('* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.');
                    res.body.missions[2].item.order.should.be.eql(2);
                    res.body.missions[2].item.title.should.be.eql("의견 작성");
                    res.body.missions[2].item.action.should.be.eql("https://www.naver.com");
                    res.body.missions[2].item.isCompleted.should.be.eql(false);

                    res.body.missions[3].order.should.be.eql(3);
                    res.body.missions[3].title.should.be.eql("두번째 미션!!!");
                    res.body.missions[3].description.should.be.eql("설문을 하라!!!!!!!!!!!");
                    res.body.missions[3].descriptionImageUrl.should.be.eql('');
                    res.body.missions[3].iconImageUrl.should.be.eql('https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png');
                    res.body.missions[3].guide.should.be.eql('* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.');
                    res.body.missions[3].item.order.should.be.eql(1);
                    res.body.missions[3].item.title.should.be.eql("의견 작성2");
                    res.body.missions[3].item.action.should.be.eql("https://www.naver.com");
                    res.body.missions[3].item.isCompleted.should.be.eql(false);

                    res.body.rewards.minimumDelay.should.be.eql(100);
                    res.body.rewards.list.length.should.be.eql(3);
                    res.body.tags.length.should.be.eql(3);
                    res.body.tags[0].should.be.eql("설문fsagsgasdadddddj 아아아아 ㄴ나나나ㅏ");
                    res.body.tags[1].should.be.eql("태그다");
                    res.body.tags[2].should.be.eql("꿀잼");

                    done();
                }).catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        });
    });

    describe('GET /beta-tests/:id/missions/:missionId/progress', () => {

        it('특정 미션의 요청한 유저의 진행 상태를 반환한다 - 참여한 경우', done => {
            request.get('/beta-tests/5d01b1f6db7d04bc2d04345c/missions/5d199ac3839927107f4bb94e/progress')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    console.log(res.body);
                    res.body._id.should.be.eql("5d199ac3839927107f4bb94e");
                    res.body.isCompleted.should.be.eql(true);

                    done();
                }).catch(err => done(err));
        });

        it('특정 미션의 요청한 유저의 진행 상태를 반환한다 - 참여하지 않은 경우', done => {
            request.get('/beta-tests/111111111111111111111111/missions/111111111111111111111112/progress')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    console.log(res.body);
                    res.body._id.should.be.eql("111111111111111111111112");
                    res.body.isCompleted.should.be.eql(false);

                    done();
                }).catch(err => done(err));
        });
    });


    describe('GET /beta-tests/mission/:id/progress', () => {

        it('특정 미션의 요청한 유저의 진행 상태를 반환한다', done => {
            sandbox.useFakeTimers(new Date("2019-06-30T02:30:00.000Z").getTime());

            request.get('/beta-tests/mission/5d1d6be5d638af0bb86b0f6d/progress')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    console.log(res.body);

                    res.body[0]._id.should.be.eql("5d199913839927107f4bb93f");
                    res.body[0].isCompleted.should.be.eql(true);
                    res.body[1]._id.should.be.eql("5d1d74d1d638af0bb86b0f6f");
                    res.body[1].isCompleted.should.be.eql(false);
                    res.body[2]._id.should.be.eql("5d1d74d6d638af0bb86b0f70");
                    res.body[2].isCompleted.should.be.eql(false);

                    done();
                }).catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        });
    });

    describe('GET /beta-tests/all/count', () => {
        it('모든 베타테스트의 개수를 조회힌다', done => {
            request.get('/beta-tests/all/count')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.text.should.be.eql("12");
                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /beta-tests/all/rewards/total', () => {
        it('모든 베타테스트의 상금 총 액을 조회한다', done => {
            request.get('/beta-tests/all/rewards/total')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.text.should.be.eql("24000");
                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /beta-tests//all/completed-users/count', () => {
        it('각 베타테스트의 완료한 유저들의 총 합을 조회한다', done => {
            request.get('/beta-tests/all/completed-users/count')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.text.should.be.eql("43");
                    done();
                }).catch(err => done(err));
        });
    });

    afterEach(done => {
        AdminUsers.remove({})
            .then(() => BetaTests.remove({}))
            .then(() => BetaTestParticipations.remove({}))
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
