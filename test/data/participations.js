const mongoose = require('mongoose');
const config = require('../../config');
const BetaTestParticipations = require('../../models/betaTestParticipations');

const ObjectId = mongoose.Types.ObjectId;
const ISODate = (ISODateString) => new Date(ISODateString);


const data = [
    {
        _id: ObjectId("111111111111111111111110"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c25c77798d78f078d8ef3ba"),
        date: ISODate("2020-03-16"),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_ATTEND,
    },
    {
        _id: ObjectId("111111111111111111111111"),
        userId: config.testUser.userId,
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-17'),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_ATTEND,
    },
    {
        _id: ObjectId("111111111111111111111112"),
        userId: config.testUser.userId,
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-17'),
        missionId: ObjectId("5d199ac3839927107f4bb94e"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111113"),
        userId: config.testUser.userId,
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-17'),
        missionId: ObjectId("5d199acb839927107f4bb94f"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111112224"),
        userId: config.testUser.userId,
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-17'),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111114"),
        userId: "otherUser",
        betaTestId : ObjectId("5d01b1f6db7d04bc2d04345c"),
        date: ISODate('2020-03-20'),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111115"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c7345f718500feddc24ca34"),
        date: ISODate("2020-03-16"),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_ATTEND,
    },
    {
        _id: ObjectId("111111111111111111111116"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c7345f718500feddc24ca34"),
        date: ISODate("2020-03-16"),
        missionId: ObjectId("5d199a0b839927107f4bb942"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111117"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c7345f718500feddc24ca34"),
        date: ISODate("2020-03-16"),
        missionId: ObjectId("5d199a13839927107f4bb943"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111118"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5ce51a069cb162da02b9f94d"),
        date: ISODate("2020-03-16"),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_ATTEND,
    },
    {
        _id: ObjectId("111111111111111111111119"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5ce51a069cb162da02b9f94d"),
        date: ISODate("2020-03-16"),
        missionId: ObjectId("5d199a97839927107f4bb94a"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111120"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c25c77798d78f078d8ef3ba"),
        date: ISODate("2020-03-16"),
        missionId: ObjectId("5d199913839927107f4bb93f"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111121"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c989f0a2917e70db5d4fc2e"),
        date: ISODate("2020-03-24"),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_ATTEND,
    },
    {
        _id: ObjectId("111111111111111111111122"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c989f0a2917e70db5d4fc2e"),
        date: ISODate("2020-03-24"),
        missionId: ObjectId("5d199a58839927107f4bb947"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111221"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c989f0a2917e70db5d4fc2e"),
        date: ISODate("2020-03-24"),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111123"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c99d101d122450cf08431aa"),
        date: ISODate("2020-03-24"),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_ATTEND,
    },
    {
        _id: ObjectId("111111111111111111111124"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c99d101d122450cf08431aa"),
        date: ISODate("2020-03-24"),
        missionId: ObjectId("5d199a84839927107f4bb949"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111224"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c99d101d122450cf08431aa"),
        date: ISODate("2020-03-24"),
        type: BetaTestParticipations.Constants.TYPE_BETA_TEST,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
    {
        _id: ObjectId("111111111111111111111125"),
        userId: config.testUser.userId,
        betaTestId: ObjectId("5c25c77798d78f078d8ef3ba"),
        date: ISODate("2020-03-16"),
        missionId: ObjectId("5d1998bb839927107f4bb93e"),
        type: BetaTestParticipations.Constants.TYPE_MISSION,
        status: BetaTestParticipations.Constants.STATUS_COMPLETE,
    },
];

module.exports = data;