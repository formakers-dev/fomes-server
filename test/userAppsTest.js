let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
let UserApps = require('../models/userApps');

chai.use(chaiHttp);

describe('UserApps', () => {
    describe('POST userApps', () => {
        before((done) => {
            UserApps.remove({userId:'testId'}, () => {
                done();
            });
        });

        it('it should POST all the apps of the user', done => {
            let doc = {
                "apps": [
                    {
                        "packageName": "com.whatever.package1",
                        "appName": "app1"
                    }, {
                        "packageName": "com.whatever.package2",
                        "appName": "app2"
                    }]
            };

            chai.request(server)
                .post('/apps/testId')
                .set('x-access-token', 'testToken')
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                })
        });
    });

    afterEach((done) => {
        UserApps.remove({userId:'testId'}, () => {
            done();
        });
    });
});