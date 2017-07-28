let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
let ShortTermStats = require('./../models/shortTermStats');
chai.use(chaiHttp);

describe('shortTermStats', () => {
    describe('POST shortTermStats', () => {
        it('it should save all shortTermStats of the user', (done) => {
            let doc = {
                "stats": [
                    {
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
                    }]
            };

            chai.request(server)
                .post("/stats/short/testId")
                .set('x-access-token', 'testToken')
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                });
        });
    });

    afterEach((done) => {
        ShortTermStats.remove({userId:'testId'}, () => {
            done();
        });
    });

});