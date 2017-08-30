const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const expect = chai.expect;
const EventStats = require('../models/eventStats');
const config = require('../config')[process.env.NODE_ENV];

chai.use(chaiHttp);

describe('eventStats', () => {
    describe('POST eventStats', () => {
        const doc = [{
                    "packageName": "com.whatever.package1",
                    "eventType": "1",
                    "timeStamp": 1499914800001
                },
                {
                    "packageName": "com.whatever.package2",
                    "eventType": "2",
                    "timeStamp": 1499914800002
                }];

        it('이벤트 통계정보를 정상적으로 저장한다', (done) => {
            chai.request(server)
                .post("/stats/event")
                .set("x-appbee-number", config.testAppbeeNumber)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);

                    EventStats.findOne({userId: config.testAppbeeNumber}, (err, eventStat) => {
                        eventStat.stats.length.should.be.eql(2);
                        verifyEventStatData(eventStat.stats[0], "com.whatever.package1", "1", 1499914800001);
                        verifyEventStatData(eventStat.stats[1], "com.whatever.package2", "2", 1499914800002);
                        done();
                    });
                });
        });

        const verifyEventStatData = (eventStat, packageName, eventType, timeStamp) => {
            eventStat.packageName.should.be.eql(packageName);
            eventStat.eventType.should.be.eql(eventType);
            eventStat.timeStamp.should.be.eql(timeStamp);
        };
    });

    afterEach((done) => {
        EventStats.remove({ userId : config.testAppbeeNumber }, () => {
            done();
        });
    });
});
