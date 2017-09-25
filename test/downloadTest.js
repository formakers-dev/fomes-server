const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../config')[process.env.NODE_ENV];
const should = chai.should();
const expect = chai.expect;
const DownloadHistories = require('../models/downloadHistories');
const server = require('../server');

chai.use(chaiHttp);

describe('Downloads', () => {
    it('다운로드 요청시 넘어온 Referer를 저장한다', done => {
        chai.request(server)
            .get('/download?referer=' + config.testUserId)
            .send()
            .end((err, res) => {
                res.statusCode.should.be.eql(200);
                res.should.redirectTo('https://s3.ap-northeast-2.amazonaws.com/appbeepkg/release/appbee-beta.apk');

                DownloadHistories.find({'userId':config.testUserId}, (err, histories) => {
                    histories.length.should.be.eql(1);
                    done();
                });
            });
    });

    afterEach((done) => {
        DownloadHistories.remove({ userId : config.testUserId }, () => {
            done();
        });
    });
});