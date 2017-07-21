let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Users', () => {
    // beforeEach((done) => { //Before each test we empty the database
    //     // Book.remove({}, (err) => {
    //     //    done();
    //     // });
    //     done();
    // });

  describe('/GET users', () => {
      it('it should GET all the users', (done) => {
        chai.request(server)
            .get('/users')
            .then(200)
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.length.should.be.eql(2);
            })
            .then(() => done(), done);
      });
  });
});
