const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const LongTermStats = require('../models/longTermStats');

chai.use(chaiHttp);

describe('longTermStats', () => {
    describe('POST longTermStats', () => {
        const doc = [{
                    packageName: 'packageA',
                    lastUsedDate: '20170101',
                    totalUsedTime: 1000
                },
                {
                    packageName: 'packageA',
                    lastUsedDate: '20170102',
                    totalUsedTime: 2000
                }];

        it('장기 통계데이터를 정상적으로 저장한다', (done) => {
            chai.request(server)
                .post('/stats/long')
                .set('x-access-token', config.appbeeToken.valid)
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
                .set('x-access-token', config.appbeeToken.invalid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/stats/long")
                .set('x-access-token', config.appbeeToken.expired)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    afterEach((done) => {
        LongTermStats.remove({ userId : config.testUserId }, () => {
            done();
        });
    });
});