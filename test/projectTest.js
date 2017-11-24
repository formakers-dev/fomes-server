const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');

const should = chai.should();

const Projects = require('../models/projects');

describe('Project', () => {
    const sandbox = sinon.sandbox.create();

    beforeEach(done => {
        Projects.create({
                "projectId": 1508998212204,
                "customerId": "testCustomerId",
                "name": "토르 - 기준스키마. 지우지마세요!!!",
                "introduce": "영화가 개봉함",
                "description": "토르는 히어로물이다.",
                "interviews": [{
                    "seq": 0,
                    "type": "offline",
                    "location": "서울대",
                    "locationDescription": "서울대오는길",
                    "apps": ['com.kakao.talk'],
                    "openDate": new Date("2017-11-01"),
                    "closeDate": new Date("2017-11-03"),
                    "interviewDate": new Date("2017-11-04"),
                    "totalCount": 2,
                    "timeSlot": {
                        "time6": "1234",
                        "time7": "",
                        "time8": "",
                    },
                    "emergencyPhone": "010-6789-0123",
                    "notifiedUserIds": [
                        "userId1234",
                        config.testUser.userId
                    ]
                }, {
                    "seq": 1,
                    "interviewDate": new Date("2017-11-12"),
                    "closeDate": new Date("2017-11-03"),
                    "openDate": new Date("2017-11-01"),
                    "location": "잠실",
                    "locationDescription": "잠실오는길",
                    "type": "offline",
                    "totalCount": 3,
                    "timeSlot": {
                        "time7": "1234",
                        "time9": "9999",
                        "time11": "",
                        "time14": config.testUser.userId,
                        "time20": ""
                    },
                    "emergencyPhone": "010-1234-5678",
                    "notifiedUserIds": [],
                    "apps": []
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
            }, done);
    });

    describe('GET /projects', () => {
        it('프로젝트 목록을 조회한다', done => {
            request.get('/projects')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);
                    res.body[0].projectId.should.be.eql(config.testProjectId);
                    res.body[0].customerId.should.be.eql("testCustomerId");
                    res.body[0].name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    res.body[0].introduce.should.be.eql('영화가 개봉함');
                    res.body[0].description.should.be.eql('토르는 히어로물이다.');
                    should.not.exist(res.body[0].interviews);
                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /projects/{id}', () => {
        it('프로젝트 상세정보를 조회한다', done => {

            request.get('/projects/' + config.testProjectId)
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.projectId.should.be.eql(config.testProjectId);
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

                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /projects/match/interviews', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-02").getTime());
        });

        it('매칭된 인터뷰 목록을 조회한다', done => {
            request.get('/projects/match/interviews')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);
                    // project
                    res.body[0].projectId.should.be.eql(1508998212204);
                    res.body[0].name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    res.body[0].introduce.should.be.eql('영화가 개봉함');
                    res.body[0].description.should.be.eql('토르는 히어로물이다.');
                    // interview
                    res.body[0].interviews.seq.should.be.eql(0);
                    res.body[0].interviews.type.should.be.eql('offline');
                    res.body[0].interviews.location.should.be.eql('서울대');
                    res.body[0].interviews.locationDescription.should.be.eql('서울대오는길');
                    res.body[0].interviews.openDate.should.be.eql('2017-11-01T00:00:00.000Z');
                    res.body[0].interviews.closeDate.should.be.eql('2017-11-03T00:00:00.000Z');
                    res.body[0].interviews.interviewDate.should.be.eql('2017-11-04T00:00:00.000Z');
                    res.body[0].interviews.apps.length.should.be.eql(1);
                    res.body[0].interviews.apps[0].should.be.eql('com.kakao.talk');
                    // 조회조건
                    res.body[0].interviews.notifiedUserIds.includes(config.testUser.userId);
                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => clock.restore());
    });

    describe('GET /projects/{id}/interviews/{seq}', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-02").getTime());
        });

        it('인터뷰 단건을 조회한다', done => {
            request.get('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq)
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    // project
                    res.body.projectId.should.be.eql(1508998212204);
                    res.body.name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    res.body.introduce.should.be.eql('영화가 개봉함');
                    res.body.description.should.be.eql('토르는 히어로물이다.');
                    // interview
                    res.body.interviews.seq.should.be.eql(0);
                    res.body.interviews.type.should.be.eql('offline');
                    res.body.interviews.location.should.be.eql('서울대');
                    res.body.interviews.locationDescription.should.be.eql('서울대오는길');
                    res.body.interviews.openDate.should.be.eql('2017-11-01T00:00:00.000Z');
                    res.body.interviews.closeDate.should.be.eql('2017-11-03T00:00:00.000Z');
                    res.body.interviews.interviewDate.should.be.eql('2017-11-04T00:00:00.000Z');
                    res.body.interviews.apps.length.should.be.eql(1);
                    res.body.interviews.apps[0].should.be.eql('com.kakao.talk');
                    // 조회조건
                    res.body.interviews.notifiedUserIds.includes(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => clock.restore());
    });

    describe('POST /projects/{id}/interviews/{seq}/participate/{slotId}', () => {
        let clock;

        beforeEach(() => {
            clock = sandbox.useFakeTimers(new Date("2017-11-02").getTime());
        });

        it('인터뷰 참가자 명단에 등록한다', done => {
            request.post('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq + '/participate/time7')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then((res) => {
                    res.body.should.be.eql(true);
                    return Projects.findOne({projectId: config.testProjectId});
                })
                .then(project => {
                    const timeSlot = project.interviews.filter(interview => interview.seq === config.testInterviewSeq)[0].timeSlot;

                    Object.keys(timeSlot).length.should.be.eql(3);
                    timeSlot.should.hasOwnProperty('time7');
                    timeSlot.time7.should.be.eql(config.testUser.userId);

                    done();
                })
                .catch(err => done(err));
        });

        it('이미 다른사람이 신청한 경우 409 에러를 리턴한다', done => {
            request.post('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq + '/participate/time6')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(409, done);
        });

        it('선택되지 않은 타임슬롯을 신청한 경우, 409 에러를 리턴한다', done => {
            request.post('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq + '/participate/time1')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(409, done);
        });

        describe('모집중이 아닌 경우', () => {
            it('모집마감시간 이전인 경우 상태코드 406으로 응답한다', done => {
                clock = sandbox.useFakeTimers(new Date("2017-10-31").getTime());

                request.post('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq + '/participate/time7')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(406, () => {
                        done();
                    });
            });

            it('모집마감시간 이후인 경우 상태코드 406으로 응답한다', done => {
                clock = sandbox.useFakeTimers(new Date("2017-11-04").getTime());

                request.post('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq + '/participate/time7')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(406, () => {
                        done();
                    });
            });

            describe('프로젝트 상태가 모집중이 아닌 경우', () => {
                beforeEach(done => {
                    Projects.findOneAndUpdate({projectId: config.testProjectId},
                        {$set: {'status': 'temporary'}}, done);
                });

                it('406 에러를 리턴한다', done => {
                    request.post('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq + '/participate/time7')
                        .set('x-access-token', config.appbeeToken.valid)
                        .expect(406, done);
                });
            });
        });

        it('이미 해당 인터뷰의 다른 시간대에 참가중이면 405 에러를 리턴한다', done => {
            request.post('/projects/' + config.testProjectId + '/interviews/1/participate/time11')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(405, done);
        });

        afterEach(() => clock.restore());
    });

    afterEach(done => {
        Projects.remove({}, () => {
            sandbox.restore();
            done();
        });
    });
});