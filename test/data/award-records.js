const mongoose = require('mongoose');
const config = require('../../config');

const ObjectId = mongoose.Types.ObjectId;

const data = [
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc3e"),
        "userId" : "user1",
        "nickName" : "user1",
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
        "nickName" : "user2",
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
        "nickName" : "user3",
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
        "nickName" : "user1",
        "betaTestId" : ObjectId("5c25e1e824196d19231fbed3"),
        "type" : "participated",
        "reward" : {
            "description" : "문화상품권 3000원",
            "price" : 3000
        }
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc42"),
        "userId" : "109974316241227718963",
        "nickName" : config.testUser.nickName,
        "betaTestId" : ObjectId("5c9892f92917e70db5d243dd"),
        "type" : "best",
        "reward" : {
            "description" : "문화상품권 5000원",
            "price" : 5000
        }
    },
    {
        "_id" : ObjectId("5e720bfd0511671bbbbbbc43"),
        "userId" : "goodUserId",
        "nickName" : "GoodUser",
        "betaTestId" : ObjectId("5c9892f92917e70db5d243dd"),
        "type" : "good",
        "reward" : {
            "description" : "문화상품권 3000원",
            "price" : 3000
        }
    },
];

module.exports = data;
