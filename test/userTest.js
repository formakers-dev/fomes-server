const chai = require('chai');
const config = require('../config');
const should = chai.should();
const Users = require('../models/user');
const RegistrationCodes = require('../models/registrationCodes');
const server = require('../server');
const request = require('supertest').agent(server);

describe('Users', () => {

    describe('POST /user/', () => {
        let testUser = config.testUser;
        testUser.registrationToken = 'new_user_token';

        it('User정보를 저장한다', done => {
            request.post('/user')
                .set('x-access-token', config.appbeeToken.valid)
                .send(testUser)
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(true);

                    Users.findOne({userId: testUser.userId}, (err, user) => {
                        user.userId.should.be.eql(testUser.userId);
                        user.gender.should.be.eql("male");
                        user.registrationToken.should.be.eql(testUser.registrationToken);
                        done();
                    });
                })
                .catch(err => done(err));
        });

        afterEach((done) => {
            Users.remove({userId: config.testUser.userId}, () => {
                done();
            });
        });
    });

    describe('GET /user/verifyInvitationCode/{code}', () => {
        before(done => {
            RegistrationCodes.create({code: 'VALIDCODE'}, done);
        });

        it('등록코드가 유효한 경우 true를 리턴한다', done => {
            request.get('/user/verifyInvitationCode/VALIDCODE')
                .send()
                .expect(200, done);
        });

        it('등록코드가 유효하지 않은 경우 false를 리턴한다', done => {
            request.get('/user/verifyInvitationCode/INVALIDCODE')
                .send()
                .expect(401, done);
        });

        after(done => {
            RegistrationCodes.remove({}, done);
        });
    });
});