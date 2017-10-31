const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);

const expect = chai.expect;
const should = chai.should();

describe('Project', () => {
    describe('GET /project', () => {
        it('프로젝트 목록을 조회한다', done => {
            request.get('/project')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .end((err, res) => {
                    res.body.length.should.be.not.eql(0);
                    expect(res.body[0]).has.property('projectId');
                    expect(res.body[0]).has.property('name');
                    expect(res.body[0]).has.property('introduce');
                    expect(res.body[0]).has.property('images');
                    expect(res.body[0]).has.property('apps');
                    expect(res.body[0]).has.property('status');
                    done();
                });
        });
    });

    describe('GET /project?projectId=xxxx', () => {
        it('프로젝트 상세정보를 조회한다', done => {
            request.get('/project?projectId=' + config.testProjectId)
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .end((err, res) => {
                    res.body.projectId.should.be.eql(config.testProjectId);
                    expect(res.body).has.property('projectId');
                    expect(res.body).has.property('customerId');
                    expect(res.body).has.property('name');
                    expect(res.body).has.property('introduce');
                    expect(res.body).has.property('images');
                    expect(res.body).has.property('apps');
                    expect(res.body).has.property('interviewer_introduce');
                    expect(res.body).has.property('description');
                    expect(res.body).has.property('description_images');
                    expect(res.body).has.property('interview');
                    expect(res.body.interview).has.property('type');
                    expect(res.body.interview).has.property('location_negotiable');
                    expect(res.body.interview).has.property('location');
                    expect(res.body.interview).has.property('open_date');
                    expect(res.body.interview).has.property('close_date');
                    expect(res.body.interview).has.property('date_negotiable');
                    expect(res.body.interview).has.property('start_date');
                    expect(res.body.interview).has.property('end_date');
                    expect(res.body.interview).has.property('plans');
                    expect(res.body.interview.plans[0]).has.property('minute');
                    expect(res.body.interview.plans[0]).has.property('plan');
                    expect(res.body).has.property('status');
                    done();
                });
        });
    });
});