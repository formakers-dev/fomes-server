let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let testConfig = require('./testConfig');
let should = chai.should();
let LongTermStats = require('../models/longTermStats');
chai.use(chaiHttp);

describe('longTermStats', () => {
    describe('POST longTermStats', () => {
        const doc = {
            stats: [
                {
                    packageName: 'packageA',
                    lastUsedDate: '20170101',
                    totalUsedTime: 1000
                },
                {
                    packageName: 'packageA',
                    lastUsedDate: '20170102',
                    totalUsedTime: 2000
                }
            ]
        };

        it('장기 통계데이터를 정상적으로 저장한다', (done) => {
            chai.request(server)
                .post('/stats/long')
                .set('x-access-token', testConfig.validToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                });
        });

        it('잘못된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/stats/long")
                .set('x-access-token', testConfig.invalidToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/stats/long")
                .set('x-access-token', testConfig.expiredToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
    });

    afterEach((done) => {
        LongTermStats.remove({userId:'testId'}, () => {
            done();
        });
    });
});