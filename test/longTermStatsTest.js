const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const expect = chai.expect;
const LongTermStats = require('../models/longTermStats');

chai.use(chaiHttp);

describe('longTermStats', () => {
    describe('POST longTermStats', () => {
        const doc = [{
                    packageName: 'appbee1.testapp.com',
                    lastUsedDate: '20170101',
                    totalUsedTime: 1000
                },
                {
                    packageName: 'appbee2.testapp.com',
                    lastUsedDate: '20170102',
                    totalUsedTime: 2000
                }];


        it('장기 통계데이터를 정상적으로 저장한다', (done) => {
            chai.request(server)
                .post('/stats/long')
                .set('x-appbee-number', config.testAppbeeNumber)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);

                    LongTermStats.findOne({userId : config.testAppbeeNumber}, (err, longTermStat) => {
                        longTermStat.stats.length.should.be.eql(2);
                        verifyLongTermStatData(longTermStat.stats[0], 'appbee1.testapp.com', '20170101', 1000);
                        verifyLongTermStatData(longTermStat.stats[1], 'appbee2.testapp.com', '20170102', 2000);
                        done();
                    });
                });
        });

        const verifyLongTermStatData = (longTermStat, packageName, lastUsedDate, totalUsedTime) => {
            longTermStat.packageName.should.be.eql(packageName);
            longTermStat.lastUsedDate.should.be.eql(lastUsedDate);
            longTermStat.totalUsedTime.should.be.eql(totalUsedTime);
        };
    });

    afterEach((done) => {
        LongTermStats.remove({ userId : config.testAppbeeNumber }, () => {
            done();
        });
    });
});