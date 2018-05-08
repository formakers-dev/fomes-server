const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const should = chai.should();
const sinon = require('sinon');
const ShortTermStats = require('../models/shortTermStats');
const Users = require('../models/user');

describe('shortTermStats', () => {
    const sandbox = sinon.sandbox.create();

    describe('POST shortTermStats', () => {
        const doc = [{
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

        describe('단기통계데이터를 성공적으로 저장하면', () => {
            it('200을 리턴하고 데이터가 저장된다', (done) => {
                request.post("/stats/short")
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(doc)
                    .expect(200)
                    .then(() => ShortTermStats.find({userId: config.testUser.userId}).sort({packageName: 1}))
                    .then(shortTermStats => {
                        shortTermStats.length.should.be.eql(2);
                        verifyShortTermStatData(shortTermStats[0], 'com.whatever.package1', 1499914700000, 1499914800000, 100000);
                        verifyShortTermStatData(shortTermStats[1], 'com.whatever.package2', 1499914700001, 1499914900001, 200000);

                        done();
                    })
                    .catch((err) => done(err));
            });

            it('해당 유저 정보에 마지막 통계 정보 업데이트 시간이 기록된다.', (done) => {
                sandbox.useFakeTimers(new Date("2018-05-02T13:30:00.000Z").getTime());

                request.post("/stats/short")
                    .set('x-access-token', config.appbeeToken.valid)
                    .send(doc)
                    .expect(200)
                    .then(() => Users.findOne({userId: config.testUser.userId}))
                    .then(user => {
                        user.lastStatsUpdateTime.should.be.eql(new Date("2018-05-02T13:30:00.000Z"));
                        done();
                    })
                    .catch((err) => done(err));
            });
        });

        it('기존에 존재하는 단기통계데이터가 있으면 덮어쓰지 않고 추가한다', (done) => {
            const newDoc = [{
                "packageName": "com.whatever.package1",
                "startTimeStamp": 1499914700002,
                "endTimeStamp": 1499914800002,
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
                        .then(() => ShortTermStats.find({userId: config.testUser.userId}).sort({startTimeStamp: 1}))
                        .then(shortTermStats => {
                            shortTermStats.length.should.be.eql(3);
                            verifyShortTermStatData(shortTermStats[0], 'com.whatever.package1', 1499914700000, 1499914800000, 100000);
                            verifyShortTermStatData(shortTermStats[1], 'com.whatever.package2', 1499914700001, 1499914900001, 200000);
                            verifyShortTermStatData(shortTermStats[2], 'com.whatever.package1', 1499914700002, 1499914800002, 100002);

                            done();
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

        it('빈 단기통계데이터를 전송한 경우, 아무 처리없이 200을 리턴한다.', done => {
            request.post("/stats/short")
                .set('x-access-token', config.appbeeToken.valid)
                .send([])
                .expect(200)
                .then(() => ShortTermStats.find({userId: config.testUser.userId}))
                .then(shortTermStats => {
                    shortTermStats.should.empty;
                    done();
                }).catch((err) => done(err));
        });

        const verifyShortTermStatData = (shortTermStat, packageName, startTimeStamp, endTimeStamp, totalUsedTime) => {
            shortTermStat.packageName.should.be.eql(packageName);
            shortTermStat.startTimeStamp.should.be.eql(startTimeStamp);
            shortTermStat.endTimeStamp.should.be.eql(endTimeStamp);
            shortTermStat.totalUsedTime.should.be.eql(totalUsedTime);
        };
    });

    afterEach((done) => {
        ShortTermStats.remove({userId: config.testUser.userId}, () => {
            sandbox.restore();
            done();
        });
    });
});