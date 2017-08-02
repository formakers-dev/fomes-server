let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let testConfig = require('./testConfig');
let should = chai.should();
let ShortTermStats = require('./../models/shortTermStats');
chai.use(chaiHttp);

describe('shortTermStats', () => {
    describe('POST shortTermStats', () => {
        let doc = {
            "stats": [
                {
                    "packageName": "com.whatever.package1",
                    "startTimeStamp": 1499914700000,
                    "endTimeStamp": 1499914800000,
                    "totalUsedTime": 100000
                },
                {
                    "packageName": "com.whatever.package2",
                    "startTimeStamp": 1499914700001,
                    "endTimeStamp": 1499914900001,
                    "totalUsedTime": 200000
                }]
        };

        it('단기통계데이터를 성공적으로 저장한다', (done) => {
            chai.request(server)
                .post("/stats/short")
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
                .post("/stats/short")
                .set('x-access-token', testConfig.invalidToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/stats/short")
                .set('x-access-token', testConfig.expiredToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
    });

    afterEach((done) => {
        ShortTermStats.remove({userId:'testId'}, () => {
            done();
        });
    });

});