let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
let LongTermStats = require('../models/longTermStats');
chai.use(chaiHttp);

describe('longTermStats', () => {
    describe('POST longTermStats', () => {
        it('it should post all longTermStats of the user', (done) => {
            let doc = {
                stats: [
                    {
                        packageName: 'packageA',
                        lastUsedDate: '20170101',
                        totalUsedTime: 1000
                    },
                    {
                        packageName: 'packageA',
                        lastUsedDate: '20170102',
                        totalUsedTime: 2000
                    }
                ]
            };

            chai.request(server)
                .post('/stats/long/testId')
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                });
        });
    });

    afterEach((done) => {
        LongTermStats.remove({userId:'testId'}, () => {
            done();
        });
    });
});