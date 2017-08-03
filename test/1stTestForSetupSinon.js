const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const setupSinon = require('./setupSinon');

setupSinon();
chai.use(chaiHttp);

const server = require('../server');

describe('Setup Test', () => {
    describe('Get /', () => {
        it('서버가 정상적으로 작동한다.', (done) => {
            chai.request(server)
                .get("/")
                .then((res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});
