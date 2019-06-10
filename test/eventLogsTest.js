const chai = require('chai');
const server = require('../server');
const config = require('../config');
const request = require('supertest').agent(server);
const sinon = require('sinon');
const should = chai.should();

const EventLogs = require('../models/eventLogs');
const helper = require('./commonTestHelper');

describe('EventLogs', () => {
    const sandbox = sinon.createSandbox();

    before(done => {
        helper.commonBefore()
            .then(() => done())
            .catch(err => done(err));
    });

    const doc = {
        code: 'BT_NOTI_TAP',
        ref: '123'
    };

    describe('POST /event-logs', () => {
        it('요청한 로그 정보를 저장한다', done => {
            sandbox.useFakeTimers(new Date("2019-01-01T00:00:00.000Z").getTime());

            request.post('/event-logs')
                .set('x-access-token', config.appbeeToken.valid)
                .send(doc)
                .expect(200)
                .then(() => EventLogs.findOne({userId: config.testUser.userId}))
                .then(insertedEventLog => {
                    insertedEventLog.userId.should.be.eql(config.testUser.userId);
                    insertedEventLog.when.should.be.eql(new Date('2019-01-01T00:00:00.000Z'));
                    insertedEventLog.code.should.be.eql('BT_NOTI_TAP');
                    insertedEventLog.ref.should.be.eql('123');

                    done();
                })
                .catch(err => done(err));
        });

        it('전달받은 토큰이 만료되도, 요청한 로그 정보를 저장한다', done => {
            sandbox.useFakeTimers(new Date("2019-01-01T00:00:00.000Z").getTime());

            request.post('/event-logs')
                .set('x-access-token', config.appbeeToken.expired)
                .send(doc)
                .expect(200)
                .then(() => EventLogs.findOne({userId: config.testUser.userId}))
                .then(insertedEventLog => {
                    insertedEventLog.userId.should.be.eql(config.testUser.userId);
                    insertedEventLog.when.should.be.eql(new Date('2019-01-01T00:00:00.000Z'));
                    insertedEventLog.code.should.be.eql('BT_NOTI_TAP');
                    insertedEventLog.ref.should.be.eql('123');

                    done();
                })
                .catch(err => done(err));
        });

        afterEach(() => {
            sandbox.restore();
        });
    });

    afterEach(done => {
        EventLogs.remove({})
            .then(() => done())
            .catch(err => done(err));
    });

    after(done => {
        helper.commonAfter()
            .then(() => done())
            .catch(err => done(err));
    });
});
