const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const testConfig = require('./testConfig');
const should = chai.should();
const Users = require('../models/user');
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const config = require('../config');
const sinon = require('sinon');

chai.use(chaiHttp);

describe('Users', () => {
    describe('GET user auth', () => {
        it('google id토큰 검증 후 API 사용을 위한 appbee 토큰을 발급하여 리턴한다', done => {
            chai.request(server)
                .get('/user/auth')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body).to.include('.');
                    done();
                });
        });

        it('리턴되는 appbee 토큰은 유효한 토큰이어야 한다', done => {
            chai.request(server)
                .get('/user/auth')
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