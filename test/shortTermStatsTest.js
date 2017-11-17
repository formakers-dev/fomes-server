const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const ShortTermStats = require('../models/shortTermStats');

describe('shortTermStats', () => {
    describe('POST shortTermStats', () => {
        const doc = [{
            "packageName": "com.whatever.package1",
            "startTimestamp": 1499914700000,
            "endTimestamp": 1499914800000,
            "totalUsedTime": 100000
        },
            {
                "packageName": "com.whatever.package2",
                "startTimestamp": 1499914700001,
                "endTimestamp": 1499914900001,
                "totalUsedTime": 200000
            }];

        it('단기통계데이터를 성공적으로 저장한다', (done) => {
            request.post("/stats/short")
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .expect(200)
                .then((res) => {
                    res.body.should.be.eql(true);

                    ShortTermStats.find({userId: config.testUser.userId}, (err, shortTermStats) => {
                        shortTermStats.length.should.be.eql(2);
                        verifyShortTermStatData(shortTermStats[0], 'com.whatever.package1', 1499914700000, 1499914800000, 100000);
                        verifyShortTermStatData(shortTermStats[1], 'com.whatever.package2', 1499914700001, 1499914900001, 200000);

                        done();
                    });
                })
                .catch((err) => done(err));
        });

        it('기존에 존재하는 단기통계데이터가 있으면 덮어쓰지 않고 추가한다', (done) => {
            const newDoc = [{
                "packageName": "com.whatever.package1",
                "startTimestamp": 1499914700002,
                "endTimestamp": 1499914800002,
                "totalUsedTime": 100002
            }];

            request.post("/stats/short")
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .expect(200)
                .then(() => {
                    request.post("/stats/short")
                        .set('x-access-token', config.appbeeToken.valid)
                        .send(newDoc)
                        .expect(200)
                        .then(res => {
                            res.body.should.be.eql(true);

                            ShortTermStats.find({userId: config.testUser.userId}, (err, shortTermStats) => {
                                shortTermStats.length.should.be.eql(3);
                                verifyShortTermStatData(shortTermStats[0], 'com.whatever.package1', 1499914700000, 1499914800000, 100000);
                                verifyShortTermStatData(shortTermStats[1], 'com.whatever.package2', 1499914700001, 1499914900001, 200000);
                                verifyShortTermStatData(shortTermStats[2], 'com.whatever.package1', 1499914700002, 1499914800002, 100002);

                                done();
                            });
                        }).catch((err) => done(err))
                }).catch((err) => done(err));
        });

        it('단기통계데이터를 잘못된 형태로 전송한 경우, 400 에러코드를 리턴한다.', done => {
            request.post('/stats/short')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });

        it('빈 단기통계데이터를 전송한 경우, 아무 처리없이 true를 리턴한다.', done => {
            request.post("/stats/short")
                .set('x-access-token', config.appbeeToken.valid)
                .send([])
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(true);

                    ShortTermStats.find({userId: config.testUser.userId}, (err, shortTermStats) => {
                        shortTermStats.length.should.be.eql(0);
                        done();
                    });

                }).catch((err) => done(err));
        });

        const verifyShortTermStatData = (shortTermStat, packageName, startTimestamp, endTimestamp, totalUsedTime) => {
            shortTermStat.packageName.should.be.eql(packageName);
            shortTermStat.startTimestamp.should.be.eql(startTimestamp);
            shortTermStat.endTimestamp.should.be.eql(endTimestamp);
            shortTermStat.totalUsedTime.should.be.eql(totalUsedTime);
        };
    });

    afterEach((done) => {
        ShortTermStats.remove({userId: config.testUser.userId}, () => {
            done();
        });
    });
});