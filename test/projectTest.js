const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);

const expect = chai.expect;
const should = chai.should();

const Projects = require('../models/projects');

describe('Project', () => {
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
                "endDate": "20171101",
                "startDate": "20171102",
                "closeDate": "20171103",
                "dateNegotiable": false,
                "openDate": "20171104",
                "location": "서울대",
                "locationNegotiable": false,
                "type": "offline",
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
                .end((err, res) => {
                    res.body.length.should.be.eql(1);
                    done();
                });
        });
    });

    describe('GET /projects/{id}', () => {
        it('프로젝트 상세정보를 조회한다', done => {
            request.get('/projects/' + config.testProjectId)
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .end((err, res) => {
                    res.body.projectId.should.be.eql(config.testProjectId);
                    res.body.customerId.should.be.eql("testCustomerId");
                    res.body.name.should.be.eql('토르 - 기준스키마. 지우지마세요!!!');
                    res.body.introduce.should.be.eql('영화가 개봉함');
                    res.body.description.should.be.eql('토르는 히어로물이다.');
                    res.body.interview.plans[0].minute.should.be.eql(60);
                    res.body.interview.plans[0].plan.should.be.eql('세부계획');
                    res.body.interview.endDate.should.be.eql('20171101');
                    res.body.interview.startDate.should.be.eql('20171102');
                    res.body.interview.closeDate.should.be.eql('20171103');
                    res.body.interview.dateNegotiable.should.be.eql(false);
                    res.body.interview.openDate.should.be.eql('20171104');
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
                });
        });
    });

    describe('POST /projects/{id}/participate', () => {
        it('인터뷰 참가자 명단에 등록한다', done => {
            request.post('/projects/' + config.testProjectId + '/participate')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .end((err, res) => {
                    res.body.should.be.eql(true);
                    Projects.findOne({projectId: config.testProjectId}, (err, result) => {
                        result.interview.participants.length.should.be.eql(1);
                        result.interview.participants[0].should.be.eql(config.testUser.userId);
                        done();
                    });
                });
        });

        //TODO : 인원초과에 대한 에러처리
        //TODO : 이미 등록된 유저에 대한 에러처리
        //TODO : 모집기간 아닌 경우 에러처리
        //TODO : 대상자가 아닌 경우 에러처리
    });

    after((done) => {
        Projects.remove({}, () => {
            done();
        });
    });
});