const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const config = require('../config')[process.env.NODE_ENV];
const UncrawledApps = require('../models/uncrawledApps');
const should = chai.should();

chai.use(chaiHttp);

describe('Apps', () => {
    describe('POST info', () => {
        const doc = ["com.facebook.katana", "com.kakao.talk"];

        it('PackageName에 해당하는 앱정보를 리턴한다', done => {
            chai.request(server)
                .post('/apps/info')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body[0].packageName.should.be.eql("com.kakao.talk");
                    res.body[1].packageName.should.be.eql("com.facebook.katana");
                    res.body[1].appName.should.be.eql("Facebook");
                    res.body[1].categoryId1.should.be.eql("/store/apps/category/SOCIAL");
                    res.body[1].categoryName1.should.be.eql("소셜");
                    res.body[1].categoryId2.should.be.eql("");
                    res.body[1].categoryName2.should.be.eql("");

                    done();
                });
        });
    });

    describe('POST uncrawled', () => {
        const doc = ["com.facebook.unknown", "com.kakao.unknown"];

        it('Uncrawled App 목록에 저장한다', done => {
            chai.request(server)
                .post('/apps/uncrawled')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql(true);

                    UncrawledApps.find({$or : [{packageName : "com.facebook.unknown"}, {packageName : "com.kakao.unknown"}]},
                        (err, uncrawledApps) => {
                            uncrawledApps.length.should.be.eql(2);
                            done();
                        });
                });
        });

        afterEach('clean up uncrawled apps', done => {
            UncrawledApps.remove({$or : [{packageName : "com.facebook.unknown"}, {packageName : "com.kakao.unknown"}]})
                .exec()
                .then(done());
        });
    });

});