const mongoose = require('mongoose');
const config = require('../../config');

const ObjectId = mongoose.Types.ObjectId;
const ISODate = (ISODateString) => new Date(ISODateString);


const data = [
    {
        _id: ObjectId("111111111111111111111111"),
        userId: config.testUser.userId,
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-17'),
    },
    {
        _id: ObjectId("111111111111111111111112"),
        userId: config.testUser.userId,
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-17'),
        missionId: ObjectId("5d199ac3839927107f4bb94e"),
    },
    {
        _id: ObjectId("111111111111111111111113"),
        userId: config.testUser.userId,
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-17'),
        missionId: ObjectId("5d199acb839927107f4bb94f"),
    }
];

module.exports = data;