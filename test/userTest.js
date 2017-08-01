let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
let Users = require('../models/user');

chai.use(chaiHttp);

describe('Users', () => {
    describe('POST users', () => {
        before((done) => {
            Users.remove({userId:'testId'}, () => {
                done();
            });
        });

        it('it should POST the user data', done => {
            let doc = {
                "userId": "testId",
                "name": "Steve"
            };
            chai.request(server)
                .post('/user')
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    // res.body.should.be.eql(true);
                    done();
                });
        });

        after((done) => {
            Users.remove({userId:'testId'}, () => {
                done();
            });
        });
    });
});