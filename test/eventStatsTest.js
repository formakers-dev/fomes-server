const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const EventStats = require('../models/eventStats');
const config = require('../config')[process.env.NODE_ENV];

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
                .post("/stats/event")
                .set('x-access-token', config.appbeeToken.invalid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('만료된 토큰은 접근을 차단한다', (done) => {
            chai.request(server)
                .post("/stats/event")
                .set('x-access-token', config.appbeeToken.expired)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(401);
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
