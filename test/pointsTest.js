const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');
const should = chai.should();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


const PointRecords = require('../models/point-records').Model;
const PointConstants = require('../models/point-records').Constants;
const helper = require('./commonTestHelper');
const pointRecordsData = require('./data/point-records');

describe('Points', () => {
  const sandbox = sinon.createSandbox();

  before(done => {
    helper.commonBefore()
      .then(() => done())
      .catch(err => done(err));
  });

  beforeEach(done => {
    PointRecords.create(pointRecordsData)
      .then(() => done())
      .catch(err => done(err));
  });

  describe('GET /points', () => {

    it('나의 전체 포인트 목록을 조회한다', done => {
      request.get('/points')
        .set('x-access-token', config.appbeeToken.valid)
        .expect(200)
        .then(res => {
          console.error(res.body);

          res.body.length.should.be.eql(3);
          res.body[0].userId.should.be.eql(config.testUser.userId);
          res.body[1].userId.should.be.eql(config.testUser.userId);
          res.body[2].userId.should.be.eql(config.testUser.userId);

          done();
        }).catch(err => done(err));
    });

    describe('나의 포인트 내역이 없으면', () => {

      beforeEach(done => {
        PointRecords.deleteMany({userId: config.testUser.userId})
          .then(() => done())
          .catch(err => done(err));
      });

      it('빈 값을 반환한다', done => {
        request.get('/points')
          .set('x-access-token', config.appbeeToken.valid)
          .expect(200)
          .then(res => {
            res.body.length.should.be.eql(0);
            done();
          }).catch(err => done(err));
      });
    })
  });

  describe('PUT /points', () => {

    it('나의 포인트를 적립한다', done => {
      sandbox.useFakeTimers(new Date("2020-06-30T17:30:00.000Z").getTime());

      const myPoint = {
        "userId": config.testUser.userId,
        "point": 10,
        "description": "마이컬러링 게임테스트 참여",
        "metaData": {
          "refType": "beta-test",
          "refId": ObjectId("5de748053ae42700175f6849")
        }
      };

      request.put('/points')
        .set('x-access-token', config.appbeeToken.valid)
        .send(myPoint)
        .expect(200)
        .then(() => PointRecords.find({userId: config.testUser.userId}))
        .then(res => {
          console.error(res);

          res.length.should.be.eql(4);
          res[0].userId.should.be.eql(config.testUser.userId);
          res[1].userId.should.be.eql(config.testUser.userId);
          res[2].userId.should.be.eql(config.testUser.userId);

          res[3].userId.should.be.eql(config.testUser.userId);
          res[3].date.should.be.eql(new Date("2020-06-30T17:30:00.000Z"));
          res[3].type.should.be.eql(PointConstants.TYPE.SAVE);
          res[3].status.should.be.eql(PointConstants.STATUS.COMPLETED);
          res[3].point.should.be.eql(10);
          res[3].description.should.be.eql("마이컬러링 게임테스트 참여");
          res[3].metaData.refType.should.be.eql("beta-test");
          res[3].metaData.refId.should.be.eql(ObjectId("5de748053ae42700175f6849"));

          done();
        }).catch(err => done(err));
    });
  });

  describe('PUT /points/withdraw', () => {

    it('나의 포인트를 출금한다', done => {
      sandbox.useFakeTimers(new Date("2020-06-30T17:30:00.000Z").getTime());

      const myPoint = {
        "point": 6000,
        "description": "마이컬러링 게임테스트 참여",
        "phoneNumber": "010-1111-2222",
      };

      request.put('/points/withdraw')
        .set('x-access-token', config.appbeeToken.valid)
        .send(myPoint)
        .expect(200)
        .then(() => PointRecords.find({userId: config.testUser.userId}))
        .then(res => {
          console.error(res);

          res.length.should.be.eql(4);
          res[0].userId.should.be.eql(config.testUser.userId);
          res[1].userId.should.be.eql(config.testUser.userId);
          res[2].userId.should.be.eql(config.testUser.userId);

          res[3].userId.should.be.eql(config.testUser.userId);
          res[3].date.should.be.eql(new Date("2020-06-30T17:30:00.000Z"));
          res[3].type.should.be.eql(PointConstants.TYPE.WITHDRAW);
          res[3].status.should.be.eql(PointConstants.STATUS.REQUEST);
          res[3].point.should.be.eql(-6000);
          res[3].description.should.be.eql("마이컬러링 게임테스트 참여");
          res[3].phoneNumber.should.be.eql("010-1111-2222");

          done();
        }).catch(err => done(err));
    });

    describe('요청된 포인트가 5000 미만이면', () => {

      const myPoint = {
        "point": 1000,
        "description": "마이컬러링 게임테스트 참여",
        "phoneNumber": "010-2222-3333"
      };

      it('412를 반환한다', done => {
        request.put('/points/withdraw')
          .set('x-access-token', config.appbeeToken.valid)
          .send(myPoint)
          .expect(412, done);
      });
    });

    describe('요청된 포인트가 가용 포인트를 초과하면', () => {

      const myPoint = {
        "point": 26100,
        "description": "5000원권 6장 교환",
        "phoneNumber": "010-2222-3333"
      };

      it('412를 반환한다', done => {
        request.put('/points/withdraw')
          .set('x-access-token', config.appbeeToken.valid)
          .send(myPoint)
          .expect(412, done);
      });
    });
  });


  describe('GET /points/available', () => {

    it('현재 사용 가능한 나의 포인트를 조회한다', done => {
      request.get('/points/available')
        .set('x-access-token', config.appbeeToken.valid)
        .expect(200)
        .then(res => {
          console.error(res.body);

          res.body.point.should.be.eql(26000);

          done();
        }).catch(err => done(err));
    });

    describe('나의 포인트 내역이 없으면', () => {

      beforeEach(done => {
        PointRecords.deleteMany({userId: config.testUser.userId})
          .then(() => done())
          .catch(err => done(err));
      });

      it('0을 반환한다', done => {
        request.get('/points/available')
          .set('x-access-token', config.appbeeToken.valid)
          .expect(200)
          .then(res => {
            res.body.point.should.be.eql(0);
            done();
          }).catch(err => done(err));
      });
    })
  });

  afterEach(done => {
    sandbox.restore();

    PointRecords.deleteMany({})
      .then(() => done())
      .catch(err => done(err));
  });

  after(done => {
    helper.commonAfter()
      .then(() => done())
      .catch(err => done(err));
  });
});
