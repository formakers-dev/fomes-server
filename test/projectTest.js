const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);

const expect = chai.expect;
const should = chai.should();

describe('Project', () => {
    describe('GET /project/all', () => {
        it('프로젝트 목록 조회', done => {
            request.get('/project/all')
                .expect(200)
                .end((err, res) => {
                    res.body.length.should.be.eql(4);
                    expect(res.body[0]).has.property('projectId');
                    expect(res.body[0]).has.property('customerId');
                    expect(res.body[0]).has.property('name');
                    expect(res.body[0]).has.property('introduce');
                    expect(res.body[0]).has.property('images');
                    expect(res.body[0]).has.property('apps');
                    expect(res.body[0]).has.property('interviewer_introduce');
                    expect(res.body[0]).has.property('description');
                    expect(res.body[0]).has.property('description_images');
                    expect(res.body[0]).has.property('interview');
                    expect(res.body[0].interview).has.property('type');
                    expect(res.body[0].interview).has.property('location_negotiable');
                    expect(res.body[0].interview).has.property('location');
                    expect(res.body[0].interview).has.property('open_date');
                    expect(res.body[0].interview).has.property('close_date');
                    expect(res.body[0].interview).has.property('date_negotiable');
                    expect(res.body[0].interview).has.property('start_date');
                    expect(res.body[0].interview).has.property('end_date');
                    expect(res.body[0].interview).has.property('plans');
                    expect(res.body[0].interview.plans[0]).has.property('minute');
                    expect(res.body[0].interview.plans[0]).has.property('plan');
                    expect(res.body[0]).has.property('status');
                    done();
                });
        });
    });

    describe('GET /project', () => {
        it('프로젝트 단건 조회', done => {
            request.get('/project?projectId=' + config.testProjectId)
                .expect(200)
                .end((err, res) => {
                    res.body.length.should.be.eql(1);
                    res.body[0].projectId.should.be.eql(config.testProjectId);
                    done();
                });
        });
    });
});