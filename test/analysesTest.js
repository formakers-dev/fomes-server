const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const expect = chai.expect;
const config = require('../config')[process.env.NODE_ENV];
const Analyses = require('../models/analyses');

chai.use(chaiHttp);

describe('analyses', () => {
    describe('POST result', () => {
        const doc = {
            "characterType" : "GAMER",
            "totalInstalledAppCount" : 100,
            "averageUsedMinutesPerDay" : 1000,
            "mostUsedApp" : "packageName1",
            "mostDownloadCategories" : [
                "categoryId1", "categoryId2", "categoryId3"
            ],
            "leastDownloadCategory" : "categoryId4",
            "mostUsedCategories" : [
                "categoryId5", "categoryId6", "categoryId7"
            ],
            "leastUsedCategory" : "categoryId8"
        };

        it('분석 결과를 저장한다', done => {
            chai.request(server)
                .post("/stats/analysis/result")
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);

                    Analyses.findOne({userId : config.testUserId}, (err, doc) => {
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
            Analyses.remove({userId : config.testUserId}, () => {
                done();
            });
        });
    });
});