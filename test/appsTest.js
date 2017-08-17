const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();

chai.use(chaiHttp);

describe('Apps', () => {
    describe('POST info', () => {
        const doc = ["com.facebook.katana", "com.kakao.talk"];

        it('PackageName에 해당하는 앱정보를 리턴한다', done => {
            chai.request(server)
                .post('/apps/info')
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body[0].packageName.should.be.eql("com.facebook.katana");
                    res.body[0].appName.should.be.eql("Facebook");
                    res.body[0].categoryId1.should.be.eql("/store/apps/category/SOCIAL");
                    res.body[0].categoryName1.should.be.eql("소셜");
                    res.body[0].categoryId2.should.be.eql("");
                    res.body[0].categoryName2.should.be.eql("");
                    res.body[1].packageName.should.be.eql("com.kakao.talk");
                    done();
                });
        });
    });

});