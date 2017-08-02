let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
let EventStats = require('./../models/eventStats');
let testConfig = require('./testConfig');
chai.use(chaiHttp);

describe('eventStats', () => {
    describe('POST eventStats', () => {
        const doc = {
            "stats": [
                {
                    "packageName": "com.whatever.package1",
                    "eventType": "1",
                    "timeStamp": 1499914800001
                },
                {
                    "packageName": "com.whatever.package2",
                    "eventType": "2",
                    "timeStamp": 1499914800002
                }]
        };

        it('이벤트 통계정보를 정상적으로 저장한다', (done) => {
            chai.request(server)
                .post("/stats/event")
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
                .post("/stats/event")
                .set('x-access-token', testConfig.invalidToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/stats/event")
                .set('x-access-token', testConfig.expiredToken)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
    });

    afterEach((done) => {
        EventStats.remove({userId:'testId'}, () => {
            done();
        });
    });
});
