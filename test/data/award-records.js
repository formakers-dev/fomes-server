const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const data = [
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc3e"),
        "userId" : "user1",
        "betaTestId" : ObjectId("5c25c77798d78f078d8ef3ba"),
        "rewardOrder" : 1,
        "price" : 3000
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc3f"),
        "userId" : "user2",
        "betaTestId" : ObjectId("5c25c77798d78f078d8ef3ba"),
        "rewardOrder" : 1,
        "price" : 3000
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc40"),
        "userId" : "user3",
        "betaTestId" : ObjectId("5c25c77798d78f078d8ef3ba"),
        "rewardOrder" : 3,
        "price" : 10000
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc41"),
        "userId" : "user1",
        "betaTestId" : ObjectId("5c25e1e824196d19231fbed3"),
        "rewardOrder" : 1,
        "price" : 3000
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc42"),
        "userId" : "user10",
        "betaTestId" : ObjectId("5c9892f92917e70db5d243dd"),
        "rewardOrder" : 2,
        "price" : 5000
    },
];

module.exports = data;
