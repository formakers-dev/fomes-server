const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const data = [
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc3e"),
        "userId" : "user1",
        "betaTestId" : ObjectId("5c25c77798d78f078d8ef3ba"),
        "type" : "participated",
        "reward" : {
            "description" : "문화상품권 3000원",
            "price" : 3000
        }
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc3f"),
        "userId" : "user2",
        "betaTestId" : ObjectId("5c25c77798d78f078d8ef3ba"),
        "type" : "participated",
        "reward" : {
            "description" : "문화상품권 3000원",
            "price" : 3000
        }
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc40"),
        "userId" : "user3",
        "betaTestId" : ObjectId("5c25c77798d78f078d8ef3ba"),
        "type" : "best",
        "reward" : {
            "description" : "문화상품권 10000원",
            "price" : 10000
        }
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc41"),
        "userId" : "user1",
        "betaTestId" : ObjectId("5c25e1e824196d19231fbed3"),
        "type" : "participated",
        "reward" : {
            "description" : "문화상품권 3000원",
            "price" : 3000
        }
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc42"),
        "userId" : "user10",
        "betaTestId" : ObjectId("5c9892f92917e70db5d243dd"),
        "type" : "best",
        "reward" : {
            "description" : "문화상품권 5000원",
            "price" : 5000
        }
    },
];

module.exports = data;
