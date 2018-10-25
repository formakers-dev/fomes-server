const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');

const should = chai.should();

const Projects = require('../models/projects');
const ParticipationHistories = require('../models/participationHistories');

describe('Project', () => {
    const sandbox = sinon.sandbox.create();
    const testProjectId = 1508998212204;

    const data = [{
        "projectId": testProjectId,
        "customerId": "testCustomerId",
        "name": "토르 - 기준스키마. 지우지마세요!!!",
        "introduce": "영화가 개봉함",
        "description": "토르는 히어로물이다.",
        "interviews": [{
            "seq": 0,
            "type": "offline",
            "introduce": "토르 1차 인터뷰 소개",
            "location": "서울대",
            "locationDescription": "서울대오는길",
            "apps": [{
                packageName: 'com.kakao.talk',
                appName: '카카오톡'
            }],
            "openDate": new Date('2017-10-31T15:00:00.000Z'),
            "closeDate": new Date("2017-11-03T14:59:59.999Z"),
            "interviewDate": new Date("2017-11-04T14:59:59.999Z"),
            "totalCount": 2,
            "timeSlot": {
                "time6": "1234",
                "time7": "",
                "time8": "",
            },
            "emergencyPhone": "010-6789-0123",
            "notifiedUserIds": [
                "1234",
                config.testUser.userId
            ]
        }, {
            "seq": 1,
            "openDate": new Date("2017-10-31T15:00:00.000Z"),
            "closeDate": new Date("2017-11-03T23:59:59.999Z"),
            "interviewDate": new Date("2017-11-12T14:59:59.999Z"),
            "location": "잠실",
            "locationDescription": "잠실오는길",
            "type": "offline",
            "introduce": "토르 2차 인터뷰 소개",
            "totalCount": 3,
            "timeSlot": {
                "time7": "1234",
                "time9": "9999",
                "time11": "",
                "time14": "0000",
                "time20": ""
            },
            "emergencyPhone": "010-1234-5678",
            "notifiedUserIds": ["1234", "9999", "0000"],
            "apps": [{
                packageName: 'com.naver.home',
                appName: '네이버홈이지'
            }]
        }, {
            "seq": 2,
            "openDate": new Date("2017-10-31T15:00:00.000Z"),
            "closeDate": new Date("2017-11-03T14:59:59.999Z"),
            "interviewDate": new Date("2017-11-12T14:59:59.999Z"),
            "location": "잠실",
            "locationDescription": "잠실오는길",
            "type": "offline",
            "introduce": "토르 3차 인터뷰 소개",
            "totalCount": 3,
            "timeSlot": {
                "time7": "1234",
                "time9": "",
                "time11": "",
                "time14": "",
                "time20": config.testUser.userId
            },
            "emergencyPhone": "010-1234-5678",
            "notifiedUserIds": ["1234", "9999", "0000", config.testUser.userId],
            "apps": [{
                packageName: 'com.kakao.talk',
                appName: '카카오톡'
            }]
        }],
        "descriptionImages": [{
            "name": "anyimage",
            "url": "www.anyimage.com"
        }],
        "image": {
            "name": "anyimage2",
            "url": "www.anyimage2.com"
        },
        "owner": {
            "name": "혜리",
            "image": {
                "name": "ownerImage",
                "url": "www.owner.com"
            },
            "introduce": "툰스토리 디자이너"
        },
        "videoUrl": "aaa.video.url",
        "status": "registered"
    }, {
        "projectId": '2',
        "customerId": "testCustomerId",
        "name": "원더우먼",
        "introduce": "재미있는 영화",
        "description": "원더우먼은 히어로물이다.",
        "interviews": [{
            "seq": 0,
            "type": "offline",
            "introduce": "원더우먼 1차 인터뷰 소개",
            "location": "우면1",
            "locationDescription": "우면오는길1",
            "apps": [{
                packageName: 'woman.beauty.com',
                appName: '우먼뷰티앱'
            }],
            "openDate": new Date("2017-10-29T15:00:00.000Z"),
            "closeDate": new Date("2017-10-31T14:59:59.999Z"),
            "interviewDate": new Date("2017-11-01T14:59:59.999Z"),
            "totalCount": 5,
            "timeSlot": {
                "time17": "",
                "time18": "",
                "time19": "",
                "time20": "",
                "time21": config.testUser.userId
            },
            "emergencyPhone": "010-9999-7777",
            "notifiedUserIds": [
                "1234",
                config.testUser.userId
            ]
        }, {
            "seq": 1,
            "type": "offline",
            "introduce": "원더우먼 2차 인터뷰 소개",
            "location": "우면",
            "locationDescription": "우면오는길",
            "apps": [{
                packageName: 'woman.beauty.com',
                appName: '우먼뷰티앱'
            }],
            "openDate": new Date("2017-11-01T15:00:00.000Z"),
            "closeDate": new Date("2017-11-04T14:59:59.999Z"),
            "interviewDate": new Date("2017-11-05T14:59:59.999Z"),
            "totalCount": 5,
            "timeSlot": {
                "time17": "",
                "time18": "",
                "time19": "",
                "time20": "",
                "time21": config.testUser.userId
            },
            "emergencyPhone": "010-9999-7777",
            "notifiedUserIds": [
                "1234",
                config.testUser.userId
            ]
        }, {
            "seq": 2,
            "type": "offline",
            "introduce": "원더우먼 3차 인터뷰 소개",
            "location": "서울",
            "locationDescription": "서울오는길",
            "apps": [{
                packageName: 'woman.beauty.com1',
                appName: '우먼뷰티앱1'
            }],
            "openDate": new Date("2017-10-31T15:00:00.000Z"),
            "closeDate": new Date("2017-11-02T14:59:59.999Z"),
            "interviewDate": new Date("2017-11-03T14:59:59.999Z"),
            "totalCount": 2,
            "timeSlot": {
                "time17": "1234",
                "time18": "5678",
                "time19": ""
            },
            "emergencyPhone": "010-9999-0001",
            "notifiedUserIds": [
                "1234",
                "5678",
                config.testUser.userId
            ]
        }],
        "descriptionImages": [{
            "name": "anyimage",
            "url": "www.anyimage.com"
        }],
        "image": {
            "name": "anyimage2",
            "url": "www.anyimage2.com"
        },
        "owner": {
            "name": "혜리",
            "image": {
                "name": "ownerImage",
                "url": "www.owner.com"
            },
            "introduce": "툰스토리 디자이너"
        },
        "videoUrl": "aaa.video.url",
        "status": "registered"
    }];

    beforeEach(done => {
        Projects.create(data, done);
    });

    describe('GET /projects', () => {
        it('프로젝트 목록을 조회한다', done => {
            request.get('/projects')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);

                    const project1 = res.body[0];

                    project1.projectId.should.be.eql(2);
                    project1.projectId.should.be.eql(2);
                    project1.customerId.should.be.eql("testCustomerId");
                    project1.name.should.be.eql('원더우먼');
                    project1.introduce.should.be.eql('재미있는 영화');
                    project1.description.should.be.eql('원더우먼은 히어로물이다.');
                    should.not.exist(project1.interviews);

                    const project2 = res.body[1];

                    project2.projectId.should.be.eql(testProjectId);
                    project2.customerId.should.be.eql("testCustomerId");
                    project2.name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    project2.introduce.should.be.eql('영화가 개봉함');
                    project2.description.should.be.eql('토르는 히어로물이다.');
                    should.not.exist(project2.interviews);

                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /projects/{id}', () => {
        it('프로젝트 상세정보를 조회한다', done => {

            request.get('/projects/' + testProjectId)
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.projectId.should.be.eql(testProjectId);
                    res.body.customerId.should.be.eql("testCustomerId");
                    res.body.name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    res.body.introduce.should.be.eql('영화가 개봉함');
                    res.body.description.should.be.eql('토르는 히어로물이다.');
                    res.body.descriptionImages[0].url.should.be.eql('www.anyimage.com');
                    res.body.descriptionImages[0].name.should.be.eql('anyimage');
                    res.body.image.name.should.be.eql('anyimage2');
                    res.body.image.url.should.be.eql('www.anyimage2.com');
                    res.body.owner.name.should.be.eql('혜리');
                    res.body.owner.image.name.should.be.eql('ownerImage');
                    res.body.owner.image.url.should.be.eql('www.owner.com');
                    res.body.owner.introduce.should.be.eql('툰스토리 디자이너');
                    should.not.exist(res.body.interviews);

                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /projects/match/interviews', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-02T02:30:00.000Z").getTime()); // 한국 기준 11월2일 11시30분
        });

        it('매칭된 인터뷰 목록 중 신청가능한 목록을 조회한다', done => {
            request.get('/projects/match/interviews')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);
                    const projectInterview = res.body[0];
                    // project
                    projectInterview.projectId.should.be.eql(1508998212204);
                    projectInterview.name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    projectInterview.introduce.should.be.eql('영화가 개봉함');
                    projectInterview.description.should.be.eql('토르는 히어로물이다.');
                    // interview
                    projectInterview.interviews.seq.should.be.eql(0);
                    projectInterview.interviews.type.should.be.eql('offline');
                    projectInterview.interviews.introduce.should.be.eql('토르 1차 인터뷰 소개');
                    projectInterview.interviews.location.should.be.eql('서울대');
                    projectInterview.interviews.locationDescription.should.be.eql('서울대오는길');
                    projectInterview.interviews.openDate.should.be.eql('2017-10-31T15:00:00.000Z');
                    projectInterview.interviews.closeDate.should.be.eql('2017-11-03T14:59:59.999Z');
                    projectInterview.interviews.interviewDate.should.be.eql('2017-11-04T14:59:59.999Z');
                    projectInterview.interviews.apps.length.should.be.eql(1);
                    projectInterview.interviews.apps[0].packageName.should.be.eql('com.kakao.talk');
                    projectInterview.interviews.apps[0].appName.should.be.eql('카카오톡');

                    // 조회조건
                    projectInterview.interviews.notifiedUserIds.should.be.includes(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => clock.restore());
    });

    describe('GET /registered/interviews', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-02T02:00:00.000Z").getTime());  //한국시간기준 11월2일 오전11시
        });

        it('해당 유저가 신청한 인터뷰 목록중 인터뷰날짜가 경과하지 않은 목록만 조회한다.', done => {
            request.get('/projects/registered/interviews')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);

                    const project1 = res.body[0];
                    project1.name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    project1.interviews.seq.should.be.eql(2);
                    project1.interviews.location.should.be.eql('잠실');
                    project1.interviews.selectedTimeSlot.should.be.eql('time20');
                    project1.interviews.openDate.should.be.eql('2017-10-31T15:00:00.000Z');
                    project1.interviews.closeDate.should.be.eql('2017-11-03T14:59:59.999Z');
                    project1.interviews.interviewDate.should.be.eql('2017-11-12T14:59:59.999Z');
                    project1.interviews.locationDescription.should.be.eql('잠실오는길');
                    project1.interviews.emergencyPhone.should.be.eql('010-1234-5678');

                    const project2 = res.body[1];
                    project2.name.should.be.eql('원더우먼');
                    project2.interviews.seq.should.be.eql(1);
                    project2.interviews.location.should.be.eql('우면');
                    project2.interviews.selectedTimeSlot.should.be.eql('time21');
                    project2.interviews.openDate.should.be.eql('2017-11-01T15:00:00.000Z');
                    project2.interviews.closeDate.should.be.eql('2017-11-04T14:59:59.999Z');
                    project2.interviews.interviewDate.should.be.eql('2017-11-05T14:59:59.999Z');
                    project2.interviews.locationDescription.should.be.eql('우면오는길');
                    project2.interviews.emergencyPhone.should.be.eql('010-9999-7777');

                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => clock.restore())
    });

    describe('GET /projects/{id}/interviews/{seq}', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-02").getTime());
        });

        it('notification 대상이 된  인터뷰 단건을 조회한다', done => {
            request.get('/projects/' + testProjectId + '/interviews/0')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    // project
                    res.body.projectId.should.be.eql(1508998212204);
                    res.body.name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    res.body.introduce.should.be.eql('영화가 개봉함');
                    res.body.description.should.be.eql('토르는 히어로물이다.');
                    // interview
                    const interview = res.body.interviews;
                    interview.seq.should.be.eql(0);
                    interview.type.should.be.eql('offline');
                    interview.introduce.should.be.eql('토르 1차 인터뷰 소개');
                    interview.location.should.be.eql('서울대');
                    interview.locationDescription.should.be.eql('서울대오는길');
                    interview.openDate.should.be.eql('2017-10-31T15:00:00.000Z');
                    interview.closeDate.should.be.eql('2017-11-03T14:59:59.999Z');
                    interview.interviewDate.should.be.eql('2017-11-04T14:59:59.999Z');
                    interview.apps.length.should.be.eql(1);
                    interview.apps[0].packageName.should.be.eql('com.kakao.talk');
                    interview.apps[0].appName.should.be.eql('카카오톡');
                    interview.totalCount.should.be.eql(2);

                    // 조회조건
                    interview.notifiedUserIds.should.be.includes(config.testUser.userId);

                    // timeslot
                    interview.timeSlots.length.should.be.eql(2);
                    interview.timeSlots.should.be.includes('time7');
                    interview.timeSlots.should.be.includes('time8');
                    interview.selectedTimeSlot.should.be.eql('');

                    done();
                })
                .catch(err => done(err));
        });

        it('사전에 신청한 인터뷰 단건을 조회할 경우 selectedTimeSlot에 해당 타임슬롯을 세팅한다', done => {
            request.get('/projects/' + testProjectId + '/interviews/2')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.interviews.timeSlots.length.should.be.eql(4);
                    res.body.interviews.timeSlots.should.be.includes('time9');
                    res.body.interviews.timeSlots.should.be.includes('time11');
                    res.body.interviews.timeSlots.should.be.includes('time14');
                    res.body.interviews.timeSlots.should.be.includes('time20');
                    res.body.interviews.selectedTimeSlot.should.be.eql('time20');

                    done();
                })
                .catch(err => done(err));
        });

        it('권한이 없는 인터뷰에 접근한 경우 406코드를 리턴한다', done => {
            request.get('/projects/' + testProjectId + '/interviews/1')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(406, done);
        });

        it('모집 가능 인원 수가 없을 경우 timeSlots을 empty List로 리턴한다', done => {
            request.get('/projects/2/interviews/2')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.interviews.timeSlots.length.should.be.eql(0);
                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => clock.restore());
    });

    describe('POST /projects/{id}/interviews/{seq}/participate/{slotId}', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-02T03:00:00.000Z").getTime()); //한국기준 11월2일 낮12시
        });

        it('인터뷰 참가자 명단에 등록한다', done => {
            const testInterviewSeq = 0;

            request.post('/projects/' + testProjectId + '/interviews/' + testInterviewSeq + '/participate/time7')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(() => Projects.findOne({projectId: testProjectId}))
                .then(project => {
                    const timeSlot = project.interviews.filter(interview => interview.seq === testInterviewSeq)[0].timeSlot;

                    Object.keys(timeSlot).length.should.be.eql(3);

                    timeSlot.hasOwnProperty('time7').should.be.eql(true);
                    timeSlot.time7.should.be.eql(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        it('인터뷰 참가신청시 신청 이력을 저장한다', done => {
            const testInterviewSeq = 0;

            request.post('/projects/' + testProjectId + '/interviews/' + testInterviewSeq + '/participate/time7')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(() => ParticipationHistories.findOne({userId: config.testUser.userId}))
                .then(participationHistory => {
                    participationHistory.type.should.be.eql('participate');
                    participationHistory.projectId.should.be.eql(testProjectId);
                    participationHistory.interviewSeq.should.be.eql(testInterviewSeq);
                    participationHistory.slotId.should.be.eql('time7');
                    done();
                })
                .catch(err => done(err));
        });

        it('이미 다른사람이 신청한 경우 409 에러를 리턴한다', done => {
            request.post('/projects/' + testProjectId + '/interviews/0/participate/time6')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(409, done);
        });

        it('선택되지 않은 타임슬롯을 신청한 경우, 416 에러를 리턴한다', done => {
            request.post('/projects/' + testProjectId + '/interviews/0/participate/time1')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(416, done);
        });

        describe('모집중이 아닌 경우', () => {
            it('이미 전체 참가자수의 모집이 완료된 경우 412으로 응답한다', done => {
                request.post('/projects/2/interviews/2/participate/time19')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(412, done);
            });

            it('모집마감시간 이전인 경우 상태코드 412으로 응답한다', done => {
                clock = sandbox.useFakeTimers(new Date("2017-10-30T15:00:00.000Z").getTime());  //한국시간 11월 1일 오전 0시

                request.post('/projects/' + testProjectId + '/interviews/0/participate/time7')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(412, () => {
                        done();
                    });
            });

            it('모집마감시간 이후인 경우 상태코드 412으로 응답한다', done => {
                clock = sandbox.useFakeTimers(new Date("2017-11-03T15:00:00.000Z").getTime());  //한국시간 11월 4일 오전 0시

                request.post('/projects/' + testProjectId + '/interviews/0/participate/time7')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(412, () => {
                        done();
                    });
            });

            describe('프로젝트 상태가 모집중이 아닌 경우', () => {
                beforeEach(done => {
                    Projects.findOneAndUpdate({projectId: testProjectId},
                        {$set: {'status': 'temporary'}}, done);
                });

                it('406 에러를 리턴한다', done => {
                    request.post('/projects/' + testProjectId + '/interviews/0/participate/time7')
                        .set('x-access-token', config.appbeeToken.valid)
                        .expect(406, done);
                });
            });
        });

        it('이미 해당 인터뷰의 다른 시간대에 참가중이면 405 에러를 리턴한다', done => {
            request.post('/projects/' + testProjectId + '/interviews/2/participate/time11')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(405, done);
        });

        afterEach(() => clock.restore());
    });

    describe('POST /projects/{id}/interviews/{seq}/cancel/{slotId}/', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-01T15:00:00.000Z").getTime());  //한국시간 11월 2일 0시
        });

        it('인터뷰 취소요청시, 해당 슬롯의 userId를 초기화한다', done => {
            request.post('/projects/' + testProjectId + '/interviews/2/cancel/time20')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(() => Projects.findOne({projectId: testProjectId}))
                .then(project => {
                    project.interviews[1].seq.should.be.eql(1);
                    project.interviews[1].timeSlot['time20'].should.be.eql('');
                    done();
                })
                .catch(err => done(err));
        });

        it('인터뷰 취소요청시, 취소이력을 저장한다', done => {
            request.post('/projects/' + testProjectId + '/interviews/2/cancel/time20')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(() => ParticipationHistories.findOne({userId: config.testUser.userId}))
                .then(participationHistory => {
                    participationHistory.type.should.be.eql('cancel');
                    participationHistory.projectId.should.be.eql(testProjectId);
                    participationHistory.interviewSeq.should.be.eql(2);
                    participationHistory.slotId.should.be.eql('time20');
                    done();
                })
                .catch(err => done(err));
        });

        it('본인 신청건이 아닌 경우, 406에러 코드를 리턴한다', done => {
            request.post('/projects/' + testProjectId + '/interviews/1/cancel/time7')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(406, done);
        });

        it('존재하지 않는 슬롯인 경우, 416에러 코드를 리턴한다', done => {
            request.post('/projects/' + testProjectId + '/interviews/1/cancel/time21')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(416, done);
        });

        describe('취소 가능일의 유효성 검증이 필요한 경우, ', () => {
            it('취소가능일 인터뷰 참가 전까지 취소요청 시, 정상적으로 취소를 진행할 수 있다.', done => {
                clock = sandbox.useFakeTimers(new Date("2017-11-12T10:59:59.999Z").getTime());  //한국기준 11월 12일 19시 59분 59초 999

                request.post('/projects/' + testProjectId + '/interviews/2/cancel/time20')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(200, done);
            });

            it('취소가능일시가 지난 경우 412에러 코드를 리턴한다', done => {
                clock = sandbox.useFakeTimers(new Date("2017-11-12T11:00:00.000Z").getTime());  //한국기준 11월 12일 20시

                request.post('/projects/' + testProjectId + '/interviews/2/cancel/time20')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(412, done);
            });

        });

        afterEach(() => clock.restore());
    });

    afterEach(done => {
        Projects.remove({}, () => {
            ParticipationHistories.remove({}, () => {
                sandbox.restore();
                done();
            });
        });
    });
});