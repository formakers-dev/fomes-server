let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let testConfig = require('./testConfig');
let should = chai.should();
let Users = require('../models/user');
let expect = chai.expect;
const jwt = require('jsonwebtoken');
const config = require('../config');

chai.use(chaiHttp);

describe('Users', () => {
    describe('GET user auth', () => {
        it('id토큰 검증 후 API 사용을 위한 액세스 토큰을 발급하여 리턴한다', done => {
            chai.request(server)
                .get('/user/auth')
                .set('x-id-token', testConfig.googleIdToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.include('.');
                    done();
                });
        });

        it('리턴되는 액세스 토큰은 유효한 토큰이어야 한다', done => {
            chai.request(server)
                .get('/user/auth')
                .set('x-id-token', testConfig.googleIdToken)
                .end((err, res) => {
                    jwt.verify(res.body, config.secret, (err) => {
                        expect(!err).to.be.true;
                        done();
                    })
                });
        });

        afterEach((done) => {
            Users.remove({userId:'testId'}, () => {
                done();
            });
        });
    });
});