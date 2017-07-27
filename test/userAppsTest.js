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
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                })
        });
    });

    describe('GET userApps', () => {
        before((done) => {
            const newUserApps = new UserApps({
                userId: "testId",
                apps: [{
                    packageName: "com.test.package",
                    appName: "testApp"
                }]
            });
            newUserApps.save(() => {
                done();
            });
        });

        it('it should GET all the apps about the input id', done => {
            chai.request(server)
                .get('/apps/testId')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body[0].userId.should.be.eql("testId");
                    res.body[0].apps[0].packageName.should.be.eql("com.test.package");
                    res.body[0].apps[0].appName.should.be.eql("testApp");
                    done();
                });
        });
    });

    afterEach((done) => {
        UserApps.remove({userId:'testId'}, () => {
            done();
        });
    });
});