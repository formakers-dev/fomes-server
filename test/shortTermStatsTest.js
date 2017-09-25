const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const expect = chai.expect;
const ShortTermStats = require('../models/shortTermStats');
chai.use(chaiHttp);

describe('shortTermStats', () => {
    describe('POST shortTermStats', () => {
        let doc = [{
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
                }];

        it('단기통계데이터를 성공적으로 저장한다', (done) => {
            chai.request(server)
                .post("/stats/short")
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);

                    ShortTermStats.findOne({userId : config.testUserId}, (err, shortTermStat) => {
                        shortTermStat.stats.length.should.be.eql(2);
                        verifyShortTermStatData(shortTermStat.stats[0], 'com.whatever.package1', 1499914700000, 1499914800000, 100000);
                        verifyShortTermStatData(shortTermStat.stats[1], 'com.whatever.package2', 1499914700001, 1499914900001, 200000);

                        done();
                    });
                });
        });

        const verifyShortTermStatData = (shortTermStat, packageName, startTimeStamp, endTimeStamp, totalUsedTime) => {
            shortTermStat.packageName.should.be.eql(packageName);
            shortTermStat.startTimeStamp.should.be.eql(startTimeStamp);
            shortTermStat.endTimeStamp.should.be.eql(endTimeStamp);
            shortTermStat.totalUsedTime.should.be.eql(totalUsedTime);
        };

        afterEach((done) => {
            ShortTermStats.remove({ userId : config.testUserId }, () => {
                done();
            });
        });
    });

    describe('GET lastUpdateStatsTimestamp', () => {
        let shortTermStat = {
            userId: config.testUserId
        };

        beforeEach((done) => {
            ShortTermStats.findOneAndUpdate({userId: shortTermStat.userId}, {$set: shortTermStat}, {upsert: true})
                .exec()
                .then(() => done());
        });

        it('저장된 lastUpdateStatsTimestamp가 없는 경우 초기값 0을 리턴한다', done => {
            chai.request(server)
                .get('/stats/short/lastUpdateStatTimestamp')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(0);
                    done();
                });
        });

        it('저장된 lastUpdateStatsTimestamp를 리턴한다', done => {
            ShortTermStats.findOneAndUpdate({userId: shortTermStat.userId}, {$set: {lastUpdateStatTimestamp: "1234567890"}}, {upsert: true})
                .exec()
                .then(() => {
                    chai.request(server)
                        .get('/stats/short/lastUpdateStatTimestamp')
                        .set('x-access-token', config.appbeeToken.valid)
                        .send()
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.eql(1234567890);
                            done();
                        });
                });
        });

        afterEach((done) => {
            ShortTermStats.remove({ userId : config.testUserId }, () => {
                done();
            });
        });
    });
});