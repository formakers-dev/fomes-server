const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const UncrawledApps = require('../models/uncrawledApps');
const AppUsages = require('../models/appUsages');
const should = chai.should();

describe('Apps', () => {
    describe('POST uncrawled', () => {
        const doc = ["com.facebook.unknown", "com.kakao.unknown"];

        it('Uncrawled App 목록에 저장한다', done => {
            request.post('/apps/uncrawled')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(true);
                    return UncrawledApps.find({$or: [{packageName: "com.facebook.unknown"}, {packageName: "com.kakao.unknown"}]}).exec()
                })
                .then(uncrawledApps => {
                    uncrawledApps.length.should.be.eql(2);
                    done();
                })
                .catch(err => done(err));
        });

        afterEach('clean up uncrawled apps', done => {
            UncrawledApps.remove({$or: [{packageName: "com.facebook.unknown"}, {packageName: "com.kakao.unknown"}]}, done);
        });
    });

    describe('POST appUsages', () => {

        beforeEach(done => {
            AppUsages.create([{
                userId: 'anotherUserId',
                packageName: 'com.pre.installed',
                totalUsedTime: 9999
            }, {
                userId: config.testUser.userId,
                packageName: 'com.kakao.talk',
                totalUsedTime: 40000
            }], function () {
                done()
            });
        });

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
                    docs.length.should.be.eql(3);
                    docs[0].userId.should.be.eql(config.testUser.userId);
                    docs[0].packageName.should.be.eql('com.kakao.talk');
                    docs[0].totalUsedTime.should.be.eql(10000);
                    docs[1].userId.should.be.eql(config.testUser.userId);
                    docs[1].packageName.should.be.eql('com.naver.talk');
                    docs[1].totalUsedTime.should.be.eql(20000);
                    docs[2].userId.should.be.eql(config.testUser.userId);
                    docs[2].packageName.should.be.eql('com.android.com');
                    docs[2].totalUsedTime.should.be.eql(30000);
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
                    docs.length.should.be.eql(1);
                    docs[0].userId.should.be.eql('anotherUserId');
                    docs[0].packageName.should.be.eql('com.pre.installed');
                    docs[0].totalUsedTime.should.be.eql(9999);
                    done();
                })
                .catch(err => done(err));
        });

        it('앱 사용기록을 잘못된 형태로 전송한 경우, 400 에러코드를 리턴한다.', done => {
            request.post('/apps/usages')
                .set('x-access-token', config.appbeeToken.valid)
                .send()
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });

        it('빈 앱 사용기록을 전송한 경우, 아무 처리없이 true를 리턴한다.', done => {
            request.post('/apps/usages')
                .set('x-access-token', config.appbeeToken.valid)
                .send([])
                .expect(200)
                .then(res => {
                    res.body.should.be.eql(true);
                    done();
                })
                .catch(err => done(err));
        });

        afterEach(done => {
            AppUsages.remove({}, done);
        });
    });
});