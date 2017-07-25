let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
chai.use(chaiHttp);

describe('UserApps', () => {

    describe('GET userApps', () => {
        it('it should GET all the apps about the input email', done => {
            chai.request(server)
                .get('/user/test@test.com/apps')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body[0].should.have.property("email");
                    res.body[0].should.have.property("apps");
                    res.body[0].apps[0].should.have.property("packageName");
                    res.body[0].apps[0].should.have.property("appName");
                    done();
                })
        });
    });

    describe('POST userApps', () => {
        it('it should POST all the apps of the user', done => {
            let doc = {
                "email": "test@test.com",
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
                .post('/user/test@test.com/apps')
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                })
        })
    })
});