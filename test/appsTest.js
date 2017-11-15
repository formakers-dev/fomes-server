const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const UncrawledApps = require('../models/uncrawledApps');
const AppUsages = require('../models/appUsages');
const should = chai.should();
const expect = chai.expect;

describe('Apps', () => {
    describe('POST info', () => {
        const doc = ["com.facebook.katana", "com.kakao.talk"];

        it('PackageName에 해당하는 앱정보를 리턴한다', done => {
            request.post('/apps/info')
                .set('x-access-token', config.appbeeToken.valid)
                .expect(200)
                .send(doc)
                .then(res => {
                    res.body[0].packageName.should.be.eql("com.kakao.talk");
                    res.body[1].packageName.should.be.eql("com.facebook.katana");
                    res.body[1].appName.should.be.eql("Facebook");
                    res.body[1].categoryId1.should.be.eql("/store/apps/category/SOCIAL");
                    res.body[1].categoryName1.should.be.eql("소셜");
                    res.body[1].categoryId2.should.be.eql("");
                    res.body[1].categoryName2.should.be.eql("");

                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('POST uncrawled', () => {
        const doc = ["com.facebook.unknown", "com.kakao.unknown"];

        it('Uncrawled App 목록에 저장한다', done => {
            request.post('/apps/uncrawled')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(true);
                    UncrawledApps.find({$or: [{packageName: "com.facebook.unknown"}, {packageName: "com.kakao.unknown"}]},
                        (err, uncrawledApps) => {
                            uncrawledApps.length.should.be.eql(2);
                            done();
                        });
                })
                .catch(err => done(err));
        });

        afterEach('clean up uncrawled apps', done => {
            UncrawledApps.remove({$or: [{packageName: "com.facebook.unknown"}, {packageName: "com.kakao.unknown"}]})
                .exec()
                .then(done());
        });
    });

    describe('POST appUsages', () => {
        const data = [{
            packageName: 'com.kakao.talk',
            totalUsedTime: 10000,
        }, {
            packageName: 'com.naver.talk',
            totalUsedTime: 20000,
        }, {
            packageName: 'com.android.com',
            totalUsedTime: 30000,
        }];

        before(done => {
            AppUsages.create([{
                userId: 'anotherUserId',
                packageName: 'com.pre.installed',
                totalUsedTime: 9999
            }, {
                userId: config.testUser.userId,
                packageName: 'com.kakao.talk',
                totalUsedTime: 40000
            }], function() {
                done()
            });
        });

        it('앱사용기록을 저장한다', done => {
            request.post('/apps/usages')
                .set('x-access-token', config.appbeeToken.valid)
                .send(data)
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(true);
                    return AppUsages.find({userId: config.testUser.userId}).exec();
                })
                .then(docs => {
                    expect(docs.length).to.be.eql(3);
                    expect(docs[0].userId).to.be.eql(config.testUser.userId);
                    expect(docs[0].packageName).to.be.eql('com.kakao.talk');
                    expect(docs[0].totalUsedTime).to.be.eql(10000);
                    expect(docs[1].userId).to.be.eql(config.testUser.userId);
                    expect(docs[1].packageName).to.be.eql('com.naver.talk');
                    expect(docs[1].totalUsedTime).to.be.eql(20000);
                    expect(docs[2].userId).to.be.eql(config.testUser.userId);
                    expect(docs[2].packageName).to.be.eql('com.android.com');
                    expect(docs[2].totalUsedTime).to.be.eql(30000);
                    done();
                })
                .catch(err => done(err));
        });

        it('앱사용기록 저장시 다른 유저의 데이터는 수정하지 않는다', done => {
            request.post('/apps/usages')
                .set('x-access-token', config.appbeeToken.valid)
                .send(data)
                .expect(200)
                .then(() => AppUsages.find({userId: 'anotherUserId'}).exec())
                .then(docs => {
                    expect(docs.length).to.be.eql(1);
                    expect(docs[0].userId).to.be.eql('anotherUserId');
                    expect(docs[0].packageName).to.be.eql('com.pre.installed');
                    expect(docs[0].totalUsedTime).to.be.eql(9999);
                    done();
                })
                .catch(err => done(err));
        });

        after(done => {
            AppUsages.remove({}).exec().then(() => done());
        });
    });
});