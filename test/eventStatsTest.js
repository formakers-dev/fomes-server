let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
let EventStats = require('./../models/eventStats');
chai.use(chaiHttp);

describe('eventStats', () => {
    describe('POST eventStats', () => {
        it('it should save all eventStats of the user', (done) => {
            let doc = {
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

            chai.request(server)
                .post("/stats/event/testId")
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
        EventStats.remove({userId:'testId'}, () => {
            done();
        });
    });
});
