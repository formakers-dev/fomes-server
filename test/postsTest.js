const chai = require('chai');
const server = require('../server');
const request = require('supertest').agent(server);
const sinon = require('sinon');
const config = require('../config');
const should = chai.should();
const helper = require('./commonTestHelper');
const Posts = require('../models/posts');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

describe('Posts', () => {
    const sandbox = sinon.createSandbox();

    const data = [{
        _id : ObjectId("5c25c77798d78f078d8ef3ba"),
        order: 1,
        openDate: new Date('2019-02-10'),
        closeDate: new Date('2019-02-13'),
        coverImageUrl: 'overviewImage_1',
        contents: 'contents_1',
    }, {
        _id : ObjectId("5c25c77798d78f078d8ef3bb"),
        order: 2,
        openDate: new Date('2019-02-10'),
        closeDate: new Date('2019-02-12'),
        coverImageUrl: 'overviewImage_2',
        contents: 'contents_2',
    }, {
        _id : ObjectId("5c25c77798d78f078d8ef3bc"),
        order: 3,
        openDate: new Date('2019-03-01'),
        closeDate: new Date('2019-03-10'),
        coverImageUrl: 'overviewImage_3',
        contents: 'contents_3',
    }, {
        _id : ObjectId("5c25c77798d78f078d8ef3bd"),
        order: 4,
        openDate: new Date('2019-01-01'),
        closeDate: new Date('2019-01-10'),
        coverImageUrl: 'overviewImage_3',
        contents: 'contents_3',
    }];

    before((done) => {
        helper.commonBefore()
            .then(() => Posts.create(data))
            .then(() => done())
            .catch(err => done(err));
    });

    describe('GET /posts', () => {
        it('현재 게시 가능한 전체 게시물을 리턴한다', done => {
            sandbox.useFakeTimers(new Date("2019-02-11T00:00:00.000Z").getTime());

            request.get('/posts')
                .expect(200)
                .then(res => {
                    res.body.length.should.be.eql(2);

                    res.body[0].order.should.be.eql(1);
                    res.body[0].openDate.should.be.eql('2019-02-10T00:00:00.000Z');
                    res.body[0].closeDate.should.be.eql('2019-02-13T00:00:00.000Z');
                    res.body[0].coverImageUrl.should.be.eql('overviewImage_1');
                    res.body[0].contents.should.be.eql('contents_1');

                    res.body[1].order.should.be.eql(2);
                    res.body[1].openDate.should.be.eql('2019-02-10T00:00:00.000Z');
                    res.body[1].closeDate.should.be.eql('2019-02-12T00:00:00.000Z');
                    res.body[1].coverImageUrl.should.be.eql('overviewImage_2');
                    res.body[1].contents.should.be.eql('contents_2');

                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /posts/detail/:id', () => {
        it('특정 게시물의 내용을 리턴한다', done => {
            request.get('/posts/detail/5c25c77798d78f078d8ef3bb')
                .expect(200)
                .then(res => {
                    res.body._id.should.be.eql('5c25c77798d78f078d8ef3bb');
                    res.body.order.should.be.eql(2);
                    res.body.openDate.should.be.eql('2019-02-10T00:00:00.000Z');
                    res.body.closeDate.should.be.eql('2019-02-12T00:00:00.000Z');
                    res.body.coverImageUrl.should.be.eql('overviewImage_2');
                    res.body.contents.should.be.eql('contents_2');

                    done();
                }).catch(err => done(err));
        });

        after(() => sandbox.restore())
    });

    after((done) => {
        helper.commonAfter()
            .then(() => Posts.remove({}))
            .then(() => done())
            .catch(err => done(err));
    });
});