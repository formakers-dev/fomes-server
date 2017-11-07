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
        Projects.create({
            "projectId": config.testProjectId,
            "customerId": "testCustomerId",
            "name": "토르 - 기준스키마. 지우지마세요!!!",
            "introduce": "영화가 개봉함",
            "description": "토르는 히어로물이다.",
            "interview": {
                "plans": [{
                    "plan": "세부계획",
                    "minute": 60
                }],
                "endDate": "20171108",
                "startDate": "20171104",
                "closeDate": "20171103",
                "dateNegotiable": false,
                "openDate": "20171101",
                "location": "서울대",
                "locationNegotiable": false,
                "type": "offline",
                "totalCount": 2,
                "participants": []
            },
            "descriptionImages": [{
                "name": "anyimage",
                "url": "www.anyimage.com"
            }],
            "apps": ["com.app.cgv"],
            "images": [{
                "name": "anyimage2",
                "url": "www.anyimage2.com"
            }],
            "isCLab": true,
            "interviewer": {
                "name": "혜리",
                "url": "www.interviewer.com",
                "introduce": "툰스토리 디자이너"
            },
            "status": "registered"
        }, () => {
            done();
        });
    });

    describe('GET /projects', () => {
        it('프로젝트 목록을 조회한다', done => {
            request.get('/projects')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(1);
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
                    res.body.interview.plans[0].minute.should.be.eql(60);
                    res.body.interview.plans[0].plan.should.be.eql('세부계획');
                    res.body.interview.endDate.should.be.eql('20171108');
                    res.body.interview.startDate.should.be.eql('20171104');
                    res.body.interview.closeDate.should.be.eql('20171103');
                    res.body.interview.dateNegotiable.should.be.eql(false);
                    res.body.interview.openDate.should.be.eql('20171101');
                    res.body.interview.location.should.be.eql('서울대');
                    res.body.interview.locationNegotiable.should.be.eql(false);
                    res.body.interview.type.should.be.eql('offline');
                    res.body.descriptionImages[0].url.should.be.eql('www.anyimage.com');
                    res.body.descriptionImages[0].name.should.be.eql('anyimage');
                    res.body.apps[0].should.be.eql('com.app.cgv');
                    res.body.images[0].name.should.be.eql('anyimage2');
                    res.body.images[0].url.should.be.eql('www.anyimage2.com');
                    res.body.isCLab.should.be.eql(true);
                    res.body.interviewer.name.should.be.eql('혜리');
                    res.body.interviewer.url.should.be.eql('www.interviewer.com');
                    res.body.interviewer.introduce.should.be.eql('툰스토리 디자이너');

                    done();
                }).catch(err => done(err));
        });
    });

    describe('POST /projects/{id}/participate', () => {
        beforeEach((done) => {
            sandbox.useFakeTimers(new Date("2017-11-02").getTime());
            done();
        });

        it('인터뷰 참가자 명단에 등록한다', done => {
            request.post('/projects/' + config.testProjectId + '/participate')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then((res) => {
                    res.body.should.be.eql(true);
                    Projects.findOne({projectId: config.testProjectId}, (err, result) => {
                        result.interview.participants.length.should.be.eql(1);
                        result.interview.participants[0].should.be.eql(config.testUser.userId);
                        done();
                    });
                }).catch(err => done(err));
        });


        describe('인터뷰 참가자 인원이 초과된 경우', ()=> {
            before((done) => {
                Projects.findOneAndUpdate({projectId: config.testProjectId},
                    {$set: { 'interview.participants' : ['testId1', 'testId2']}})
                    .exec()
                    .then(() => done());
            });

            it('상태코드 416으로 응답한다, ', done => {
                request.post('/projects/' + config.testProjectId + '/participate')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(416)
                    .then(() => {
                        Projects.findOne({projectId: config.testProjectId}, (err, result) => {
                            result.interview.participants.length.should.be.eql(2);
                            result.interview.participants[0].should.be.eql("testId1");
                            result.interview.participants[1].should.be.eql("testId2");
                            done();
                        });
                    })
                    .catch(err => done(err));
            });

        });

        describe('이미 등록된 유저인 경우', ()=> {
            before((done) => {
                Projects.findOneAndUpdate({projectId: config.testProjectId},
                    {$set: { 'interview.participants' : [ config.testUser.userId ]}})
                    .exec()
                    .then(() => done());
            });

            it('상태코드 409으로 응답한다', done => {
                request.post('/projects/' + config.testProjectId + '/participate')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(409)
                    .then(() => {
                        Projects.findOne({projectId: config.testProjectId}, (err, result) => {
                            result.interview.participants.length.should.be.eql(1);
                            result.interview.participants[0].should.be.eql(config.testUser.userId);
                            done();
                        });
                    })
                    .catch(err => done(err));
            });

        });

        describe('모집기간이 아닌 경우', ()=> {
            let clock;

            describe('모집마감시간 이후인 경우', () => {
                beforeEach((done) => {
                    clock = sinon.useFakeTimers(new Date("2017-11-04").getTime());
                    done();
                });

                it('상태코드 406으로 응답한다', done => {
                    request.post('/projects/' + config.testProjectId + '/participate')
                        .set('x-access-token', config.appbeeToken.valid)
                        .expect(406)
                        .then(() => {
                            Projects.findOne({projectId: config.testProjectId}, (err, result) => {
                                result.interview.participants.length.should.be.eql(0);
                                done();
                            });
                        })
                        .catch(err => done(err));
                });
            });

            describe('모집시작시간 이전인 경우', () => {
                beforeEach((done) => {
                    clock = sinon.useFakeTimers(new Date("2017-10-31").getTime());
                    done();
                });

                it('상태코드 406으로 응답한다', done => {
                    request.post('/projects/' + config.testProjectId + '/participate')
                        .set('x-access-token', config.appbeeToken.valid)
                        .expect(406)
                        .then(() => {
                            Projects.findOne({projectId: config.testProjectId}, (err, result) => {
                                result.interview.participants.length.should.be.eql(0);
                                done();
                            });
                        })
                        .catch(err => done(err));
                });
            });

            afterEach(done => {
                clock.restore();
                done();
            })
        });

        describe('프로젝트 상태가 모집중이 아닌 경우', ()=> {
            before((done) => {
                Projects.findOneAndUpdate({projectId: config.testProjectId},
                    {$set: { status : 'temporary' }})
                    .exec()
                    .then(() => done());
            });

            it('상태코드 406으로 응답한다', done => {
                request.post('/projects/' + config.testProjectId + '/participate')
                    .set('x-access-token', config.appbeeToken.valid)
                    .expect(406)
                    .then(() => {
                        Projects.findOne({projectId: config.testProjectId}, (err, result) => {
                            result.interview.participants.length.should.be.eql(0);
                            done();
                        });
                    })
                    .catch(err => done(err));
            });
        });

        //TODO : 대상자가 아닌 경우 에러처리 - 405 => 아직 알 수 없음.

        afterEach(done => {
            sandbox.restore();

            Projects.findOneAndUpdate({projectId: config.testProjectId},
                {$set: { 'interview.participants' : []}})
                .exec()
                .then(() => done())
                .catch((err) => done(err));
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