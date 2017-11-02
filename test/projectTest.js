const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);

const expect = chai.expect;
const should = chai.should();

const Projects = require('../models/projects');

describe('Project', () => {
    before((done) => {
        Projects.remove({}, () => {
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
                    "end_date": "20171101",
                    "start_date": "20171102",
                    "close_date": "20171103",
                    "date_negotiable": false,
                    "open_date": "20171104",
                    "location": "서울대",
                    "location_negotiable": false,
                    "type": "offline"
                },
                "description_images": [{
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
                    res.body.interview.end_date.should.be.eql('20171101');
                    res.body.interview.start_date.should.be.eql('20171102');
                    res.body.interview.close_date.should.be.eql('20171103');
                    res.body.interview.date_negotiable.should.be.eql(false);
                    res.body.interview.open_date.should.be.eql('20171104');
                    res.body.interview.location.should.be.eql('서울대');
                    res.body.interview.location_negotiable.should.be.eql(false);
                    res.body.interview.type.should.be.eql('offline');
                    res.body.description_images[0].url.should.be.eql('www.anyimage.com');
                    res.body.description_images[0].name.should.be.eql('anyimage');
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

    after((done) => {
        Projects.remove({}, () => {
            done();
        });
    });
});