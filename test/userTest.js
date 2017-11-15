const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../config');
const should = chai.should();
const Users = require('../models/user');
const jwt = require('jsonwebtoken');
require('./setupSinon')();
const server = require('../server');

chai.use(chaiHttp);

describe('Users', () => {

    describe('POST user', () => {
        let testUser = config.testUser;
        testUser.registrationToken = 'new_user_token';

        it('User정보를 저장한다', done => {
            chai.request(server)
                .post('/user')
                .set('x-access-token', config.appbeeToken.valid)
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);

                    Users.findOne({userId: testUser.userId}, (err, user) => {
                        user.userId.should.be.eql(testUser.userId);
                        user.gender.should.be.eql("male");
                        user.registrationToken.should.be.eql(testUser.registrationToken);
                        done();
                    });
                });
        });

        afterEach((done) => {
            Users.remove({userId: config.testUser.userId}, () => {
                done();
            });
        });
    });
});