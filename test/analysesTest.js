const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const expect = chai.expect;
const config = require('../config')[process.env.NODE_ENV];
const Analyses = require('../models/analyses');
const ShortTermStats = require('../models/shortTermStats');

chai.use(chaiHttp);

describe('analyses', () => {
    describe('POST result', () => {
        const doc = {
            "characterType": "GAMER",
            "totalInstalledAppCount": 100,
            "averageUsedMinutesPerDay": 1000,
            "mostUsedApp": "packageName1",
            "mostDownloadCategories": [
                "categoryId1", "categoryId2", "categoryId3"
            ],
            "leastDownloadCategory": "categoryId4",
            "mostUsedCategories": [
                "categoryId5", "categoryId6", "categoryId7"
            ],
            "leastUsedCategory": "categoryId8"
        };

        it('분석 결과를 저장한다', done => {
            chai.request(server)
                .post("/stats/analysis/result")
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);

                    Analyses.findOne({userId: config.testUserId}, (err, doc) => {
                        doc.should.be.ok;

                        doc.userId.should.be.eql(config.testUserId);

                        doc.characterType.should.be.eql('GAMER');
                        doc.totalInstalledAppCount.should.be.eql(100);
                        doc.averageUsedMinutesPerDay.should.be.eql(1000);
                        doc.mostUsedApp.should.be.eql('packageName1');
                        doc.mostDownloadCategories.length.should.be.eql(3);
                        doc.mostDownloadCategories[0].should.be.eql("categoryId1");
                        doc.mostDownloadCategories[1].should.be.eql("categoryId2");
                        doc.mostDownloadCategories[2].should.be.eql("categoryId3");
                        doc.leastDownloadCategory.should.be.eql("categoryId4");
                        doc.mostUsedCategories[0].should.be.eql("categoryId5");
                        doc.mostUsedCategories[1].should.be.eql("categoryId6");
                        doc.mostUsedCategories[2].should.be.eql("categoryId7");
                        doc.leastUsedCategory.should.be.eql("categoryId8");

                        done();
                    });
                });
        });

        afterEach((done) => {
            Analyses.remove({userId: config.testUserId}, () => {
                done();
            });
        });
    });

    describe('GET overview analysis', () => {
        describe('단기통계데이터가 없는 경우', () => {
            it('비어있는 결과를 리턴한다', done => {
                chai.request(server)
                    .get("/stats/analysis/overview")
                    .set('x-access-token', config.appbeeToken.valid)
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.mostUsedApp.should.be.eql('');
                        res.body.averageUsedMinutesPerDay.should.be.eql(0);
                        done();
                    });
            });
        });

        describe('단기통계데이터가 있는 경우', () => {
            const doc = {
                lastUpdateStatTimestamp: "1234567890",
                stats: [{
                    "packageName": "com.whatever.package1",
                    "startTimeStamp": 1499910000000,    //2017-07-13 10:40:00
                    "endTimeStamp": 1499910100000,      //2017-07-13 10:41:40
                    "totalUsedTime": 100000
                },
                {
                    "packageName": "com.whatever.package2",
                    "startTimeStamp": 1499914801000,    //2017-07-13 12:00:01
                    "endTimeStamp": 1499915001000,      //2017-07-13 12:03:21
                    "totalUsedTime": 200000
                },
                {
                    "packageName": "com.whatever.package1",
                    "startTimeStamp": 1500000000000,    //2017-07-14 11:40:00
                    "endTimeStamp": 1500005000000,      //2017-07-14 13:03:20
                    "totalUsedTime": 5000000
                }]
            };

            before((done) => {
                ShortTermStats.findOneAndUpdate({userId: config.testUserId}, {$set: doc}, {upsert: true})
                    .exec()
                    .then(() => done());
            });

            it('단기통계 데이터를 기준으로 Overview를 분석하여 결과를 리턴한다', done => {
                chai.request(server)
                    .get("/stats/analysis/overview")
                    .set('x-access-token', config.appbeeToken.valid)
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.mostUsedApp.should.be.eql('com.whatever.package1');
                        res.body.averageUsedMinutesPerDay.should.be.eql(44);
                        done();
                    });
            });

            after((done) => {
                ShortTermStats.remove({userId: config.testUserId})
                    .exec()
                    .then(() => done());
            });
        });

    });
});