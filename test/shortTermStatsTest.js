let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
chai.use(chaiHttp);

describe('shortTermStats', () => {
    describe('POST shortTermStats', () => {
        it('it should save all shortTermStats of the user', (done) => {
            let doc = {
                "email": "test@test.com",
                "stats": [
                    {
                        "packageName": "com.whatever.package1",
                        "eventType": "1",
                        "timeStamp": 1499914800000
                    }, {
                        "packageName": "com.whatever.package2",
                        "eventType": "2",
                        "timeStamp": 1499914800001
                    }]
            };

            chai.request(server)
                .post("/user/test@test.com/shortTermStats")
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                })
        });
    });

    describe('GET shortTermStats', () => {
        it('it should get all shortTermStats of the user', (done) => {
            chai.request(server)
                .get("/user/test@test.com/shortTermStats")
                .end((err, res)=> {
                    res.should.have.status(200);
                    res.body[0].should.have.property("email");
                    res.body[0].should.have.property("stats");
                    res.body[0].stats[0].should.have.property("packageName");
                    res.body[0].stats[0].should.have.property("eventType");
                    res.body[0].stats[0].should.have.property("timeStamp");
                    done();
                })
        });
    });
});