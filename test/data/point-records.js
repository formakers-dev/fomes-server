const mongoose = require('mongoose');
const config = require('../../config');
const PointConstants = require('../../models/point-records').Constants;

const ObjectId = mongoose.Types.ObjectId;
const ISODate = (ISODateString) => new Date(ISODateString);

const data = [
    {
        "_id" : ObjectId("5efaedeae03734ef5dad8c10"),
        "userId" : config.testUser.userId,
        "date" : ISODate("2020-06-30T00:00:00.000Z"),
        "point" : 1000,
        "type" : PointConstants.TYPE.SAVE,
        "status" : PointConstants.STATUS.COMPLETED,
        "description" : "더팜 게임테스트 성실상",
        "metaData" : {
            "refType" : "beta-test",
            "refId" : ObjectId("5dd38c8cb1e19307f5fce299")
        }
    },
    {
        "_id" : ObjectId("5efaee3be03734ef5dada401"),
        "userId" : config.testUser.userId,
        "date" : ISODate("2020-06-29T00:00:00.000Z"),
        "point" : 30000,
        "type" : PointConstants.TYPE.SAVE,
        "status" : PointConstants.STATUS.COMPLETED,
        "description" : "마이컬러링 게임테스트 수석",
        "metaData" : {
            "refType" : "beta-test",
            "refId" : ObjectId("5de748053ae42700175f6849")
        }
    },
    {
        "_id" : ObjectId("5efaee3be03734ef5dada999"),
        "userId" : "user1",
        "date" : ISODate("2020-05-15T00:00:00.000Z"),
        "point" : 5000,
        "type" : PointConstants.TYPE.SAVE,
        "status" : PointConstants.STATUS.COMPLETED,
        "description" : "고양이숲 게임테스트 수석",
        "metaData" : {
            "refType" : "beta-test",
            "refId" : ObjectId("5cb3ef0db5e8fc246c3b6c18")
        }
    },
    {
        "_id" : ObjectId("5efaee3be03734ef5dadb888"),
        "userId" : config.testUser.userId,
        "date" : ISODate("2020-07-01T00:00:00.000Z"),
        "point" : -5000,
        "type" : PointConstants.TYPE.EXCHANGE,
        "status" : PointConstants.STATUS.COMPLETED,
        "description" : "문화상품권 1장 교환 신청",
        "metaData" : {
            "type" : "giftCertificate5000",
            "count" : 2,
            "phone" : '010-1111-2222'
        }
    }
];

module.exports = data;
