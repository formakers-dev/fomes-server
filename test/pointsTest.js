const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');
const should = chai.should();

const PointRecords = require('../models/point-records');
const helper = require('./commonTestHelper');
const pointRecordsData = require('./data/point-records');

describe('Points', () => {
    const sandbox = sinon.createSandbox();

    before(done => {
        helper.commonBefore()
            .then(() => done())
            .catch(err => done(err));
    });

    beforeEach(done => {
      PointRecords.create(pointRecordsData)
        .then(() => done())
        .catch(err => done(err));
    });

    describe('GET /points', () => {

        it('나의 전체 포인트 목록을 조회한다', done => {
            request.get('/points')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .then(res => {
                    console.error(res.body);

                    res.body.length.should.be.eql(2);
                    res.body[0].userId.should.be.eql(config.testUser.userId);
                    res.body[1].userId.should.be.eql(config.testUser.userId);

                    done();
                }).catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        });
    });

    afterEach(done => {
      PointRecords.deleteMany({})
        .then(() => done())
        .catch(err => done(err));
    });

    after(done => {
        helper.commonAfter()
            .then(() => done())
            .catch(err => done(err));
    });
});
