let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server');
let should = chai.should();
chai.use(chaiHttp);

describe('longTermStats', () => {
    describe('POST longTermStats', () => {
        it('it should post all longTermStats of the user', (done) => {
            let doc = {
                email: 'test@test.com',
                stats: [
                    {
                        packageName: 'packageA',
                        lastUsedDate: '20170101',
                        totalUsedTime: 1000
                    },
                    {
                        packageName: 'packageA',
                        lastUsedDate: '20170102',
                        totalUsedTime: 2000
                    }
                ]
            };
            chai.request(server)
                .post('/user/test@test.com/longTermStats')
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);
                    done();
                });
        });
    });

    describe('GET longTermStats', () => {
      it('it should get all longTermStats of the user', (done) => {
          chai.request(server)
              .get("/user/test@test.com/longTermStats")
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body[0].should.have.property("email");
                  res.body[0].should.have.property("stats");
                  res.body[0].stats[0].should.have.property("packageName");
                  res.body[0].stats[0].should.have.property("lastUsedDate");
                  res.body[0].stats[0].should.have.property("totalUsedTime");
                  done();
              });
      });
   });
});