const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');

const should = chai.should();

const Projects = require('../models/projects');

describe('Project', () => {
    const sandbox = sinon.sandbox.create();

    before((done) => {
        Projects.remove({}, () => {
            Projects.create(
                {
                    "projectId": 1508998212204,
                    "customerId": "testCustomerId",
                    "name": "토르 - 기준스키마. 지우지마세요!!!",
                    "introduce": "영화가 개봉함",
                    "description": "토르는 히어로물이다.",
                    "interviews": [{
                        "seq": 0,
                        "status": "registered",
                        "plans": [{
                            "plan": "세부계획",
                            "minute": 60
                        }],
                        "interviewDate": new Date("2017-11-04"),
                        "closeDate": new Date("2017-11-03"),
                        "openDate": new Date("2017-11-01"),
                        "location": "서울대",
                        "type": "offline",
                        "totalCount": 2,
                        "timeSlots": [{
                            "id": 10000,
                            "time": 6,
                            "userId": "1234"
                        }, {
                            "id": 10001,
                            "time": 7,
                        }, {
                            "id": 10002,
                            "time": 8,
                        }],
                        "notifiedUserIds": [
                            "userId1234",
                            config.testUser.userId
                        ],
                        "apps": ['com.kakao.talk']
                    }, {
                        "seq": 1,
                        "status": "registered",
                        "plans": [{
                            "plan": "세부계획2",
                            "minute": 60
                        }],
                        "interviewDate": new Date("2017-11-12"),
                        "closeDate": new Date("2017-11-03"),
                        "openDate": new Date("2017-11-01"),
                        "location": "잠실",
                        "type": "offline",
                        "totalCount": 3,
                        "timeSlots": [{
                            "id": 20000,
                            "time": 7,
                            "userId": "1234"
                        }, {
                            "id": 20001,
                            "time": 9,
                            "userId": "9999"
                        }, {
                            "id": 20002,
                            "time": 11,
                        }, {
                            "id": 3,
                            "time": 14,
                        }, {
                            "id": 4,
                            "time": 20,
                        }]
                    }],
                    "descriptionImages": [{
                        "name": "anyimage",
                        "url": "www.anyimage.com"
                    }],
                    "images": [{
                        "name": "anyimage2",
                        "url": "www.anyimage2.com"
                    }],
                    "interviewer": {
                        "name": "혜리",
                        "url": "www.interviewer.com",
                        "introduce": "툰스토리 디자이너"
                    },
                    "status": "registered"
                }, () => done()
            );
        });
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
                    res.body.images[0].name.should.be.eql('anyimage2');
                    res.body.images[0].url.should.be.eql('www.anyimage2.com');
                    res.body.interviewer.name.should.be.eql('혜리');
                    res.body.interviewer.url.should.be.eql('www.interviewer.com');
                    res.body.interviewer.introduce.should.be.eql('툰스토리 디자이너');

                    done();
                }).catch(err => done(err));
        });
    });

    describe('POST /projects/{id}/interviews/{seq}/participate/{slotId}', () => {
        beforeEach((done) => {
            sandbox.useFakeTimers(new Date("2017-11-02").getTime());
            done();
        });

        it('인터뷰 참가자 명단에 등록한다', done => {
            let clock = sinon.useFakeTimers(new Date("2017-11-02").getTime());
            const testSlotId = 10001;
            request.post('/projects/' + config.testProjectId + '/interviews/' + config.testInterviewSeq + '/participate/' + testSlotId)
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then((res) => {
                    res.body.should.be.eql(true);
                    Projects.aggregate([
                        {'$match': {projectId: config.testProjectId}},
                        {'$unwind': '$interviews'},
                        {'$match': {'interviews.seq': config.testInterviewSeq}},
                        {
                            '$project': {
                                'projectId': true,
                                'interviewSeq': '$interviews.seq',
                                'openDate': '$interviews.openDate',
                                'closeDate': '$interviews.closeDate',
                                'status': '$interviews.status',
                                'timeSlots': '$interviews.timeSlots',
                            }
                        }
                    ], (err, projects) => {
                        const project = projects[0];
                        project.timeSlots.length.should.be.eql(3);
                        project.timeSlots.filter(timeSlot => timeSlot.id === testSlotId).length.should.be.eql(1);
                        project.timeSlots.filter(timeSlot => timeSlot.id === testSlotId)[0].userId.should.be.eql(config.testUser.userId);

                        clock.restore();
                        done();
                    });
                }).catch(err => done(err));
        });

        // describe('이미 등록된 유저인 경우', () => {
        //     before((done) => {
        //         Projects.findOneAndUpdate({$and: [{projectId: config.testProjectId}, {'interviews.seq': config.testInterviewSeq}]},
        //             {$set: {'interviews.$.participants': [{userId: config.testUser.userId}]}})
        //             .exec()
        //             .then(() => done())
        //             .catch(err => done(err));
        //     });
        //
        //     it('상태코드 409으로 응답한다', done => {
        //         request.post('/projects/' + config.testProjectId + '/' + config.testInterviewSeq + '/participate')
        //             .set('x-access-token', config.appbeeToken.valid)
        //             .expect(409)
        //             .then(() => {
        //                 Projects.aggregate([
        //                     {'$match': {projectId: config.testProjectId}},
        //                     {'$unwind': '$interviews'},
        //                     {'$match': {'interviews.seq': config.testInterviewSeq}},
        //                     {
        //                         '$project': {
        //                             'projectId': true,
        //                             'interviewSeq': '$interviews.seq',
        //                             'openDate': '$interviews.openDate',
        //                             'closeDate': '$interviews.closeDate',
        //                             'status': '$interviews.status',
        //                             'participants': '$interviews.participants'
        //                         }
        //                     }
        //                 ], (err, projects) => {
        //                     const interview = projects[0];
        //                     interview.participants.filter(user => user.userId === config.testUser.userId).length.should.be.eql(1);
        //                     done();
        //                 });
        //             })
        //             .catch(err => done(err));
        //     });
        // });
        //
        // describe('모집기간이 아닌 경우', () => {
        //     describe('모집마감시간 이후인 경우', () => {
        //         beforeEach((done) => {
        //             done();
        //         });
        //
        //         it('상태코드 406으로 응답한다', done => {
        //             let clock = sinon.useFakeTimers(new Date("2017-11-04").getTime());
        //             request.post('/projects/' + config.testProjectId + '/' + config.testInterviewSeq + '/participate')
        //                 .set('x-access-token', config.appbeeToken.valid)
        //                 .expect(406)
        //                 .then(() => {
        //                     clock.restore();
        //                     done();
        //                 })
        //                 .catch(err => done(err));
        //         });
        //     });
        //
        //     describe('모집시작시간 이전인 경우', () => {
        //         beforeEach((done) => {
        //             done();
        //         });
        //
        //         it('상태코드 406으로 응답한다', done => {
        //             const clock = sinon.useFakeTimers(new Date("2017-10-31").getTime());
        //             request.post('/projects/' + config.testProjectId + '/' + config.testInterviewSeq + '/participate')
        //                 .set('x-access-token', config.appbeeToken.valid)
        //                 .expect(406)
        //                 .then(() => {
        //                     clock.restore();
        //                     done();
        //                 })
        //                 .catch(err => done(err));
        //         });
        //     });
        // });
        //
        // describe('프로젝트 상태가 모집중이 아닌 경우', () => {
        //     before((done) => {
        //         Projects.findOneAndUpdate({$and: [{projectId: config.testProjectId}, {'interviews.seq': config.testInterviewSeq}]},
        //             {$set: {'interviews.$.status': 'temporary'}})
        //             .exec()
        //             .then(() => done())
        //             .catch(err => done(err));
        //     });
        //
        //     it('상태코드 406으로 응답한다', done => {
        //         request.post('/projects/' + config.testProjectId + '/' + config.testInterviewSeq + '/participate')
        //             .set('x-access-token', config.appbeeToken.valid)
        //             .expect(406)
        //             .then(() => {
        //                 done();
        //             })
        //             .catch(err => done(err));
        //     });
        // });

        //TODO : 대상자가 아닌 경우 에러처리 - 405 => 아직 알 수 없음.

        afterEach(done => {
            sandbox.restore();

            Projects.findOneAndUpdate({projectId: config.testProjectId},
                {$set: {'interview.participants': []}})
                .exec()
                .then(() => done())
                .catch((err) => done(err));
        });
    });

    describe('GET /projects/match/interviews', () => {
        it('매칭된 인터뷰 목록을 조회한다', done => {
            const clock = sinon.useFakeTimers(new Date("2017-11-02").getTime());
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
                    res.body[0].interviews.openDate.should.be.eql('2017-11-01T00:00:00.000Z');
                    res.body[0].interviews.closeDate.should.be.eql('2017-11-03T00:00:00.000Z');
                    res.body[0].interviews.interviewDate.should.be.eql('2017-11-04T00:00:00.000Z');
                    res.body[0].interviews.apps.length.should.be.eql(1);
                    res.body[0].interviews.apps[0].should.be.eql('com.kakao.talk');
                    res.body[0].interviews.plans.length.should.be.eql(1);
                    res.body[0].interviews.plans[0].minute.should.be.eql(60);
                    res.body[0].interviews.plans[0].plan.should.be.eql('세부계획');
                    // 조회조건
                    res.body[0].interviews.notifiedUserIds.includes(config.testUser.userId);

                    clock.restore();
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('GET /projects/{id}/interviews/{seq}', () => {
        it('인터뷰 단건을 조회한다', done => {
            const clock = sinon.useFakeTimers(new Date("2017-11-02").getTime());
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
                    res.body.interviews.openDate.should.be.eql('2017-11-01T00:00:00.000Z');
                    res.body.interviews.closeDate.should.be.eql('2017-11-03T00:00:00.000Z');
                    res.body.interviews.interviewDate.should.be.eql('2017-11-04T00:00:00.000Z');
                    res.body.interviews.apps.length.should.be.eql(1);
                    res.body.interviews.apps[0].should.be.eql('com.kakao.talk');
                    res.body.interviews.plans.length.should.be.eql(1);
                    res.body.interviews.plans[0].minute.should.be.eql(60);
                    res.body.interviews.plans[0].plan.should.be.eql('세부계획');
                    // 조회조건
                    res.body.interviews.notifiedUserIds.includes(config.testUser.userId);

                    clock.restore();
                    done();
                })
                .catch(err => done(err));
        });
    });

    afterEach(done => {
        sandbox.restore();
        done();
    });

    after((done) => {
        Projects.remove({}, () => {
            done();
        });
    });
});