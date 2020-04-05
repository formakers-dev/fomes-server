const mongoose = require('mongoose');
const config = require('../../config');

const ObjectId = mongoose.Types.ObjectId;
const ISODate = (ISODateString) => new Date(ISODateString);

// "google109974316241227718963" => config.testUser.userId

const data = [
    {
        "_id" : ObjectId("5c25c77798d78f078d8ef3ba"),
        "title" : "포메스 설문조사 입니다! 제목이 좀 길어요 깁니다요 길어요오 제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오제목이 좀 길어요 깁니다요 길어요오",
        "description" : "갑자기 분위기 설문조사! 포메스 앱에 대한 설문조사입니다 :-D",
        "subjectType" : "fomes-test",
        "progressText" : {
            "ready" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "플레이"
        ],
        "coverImageUrl" : "https://images.pexels.com/photos/669609/pexels-photo-669609.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&h=500&w=500",
        "iconImageUrl" : "https://images.pexels.com/photos/669609/pexels-photo-669609.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&h=500&w=500",
        "openDate" : ISODate("2018-12-28T00:00:00.000Z"),
        "closeDate" : ISODate("2119-12-31T00:00:00.000Z"),
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "참여보상(10명 추첨)",
                    "content" : "문화상품권 3000원",
                    "price": "3000",
                },
                {
                    "order" : 2,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 용사(3명 선정)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                },
                {
                    "order" : 3,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 영웅(1명 선정)",
                    "content" : "문화상품권 10000원",
                    "price": "10000",
                }
            ]
        },
        "similarApps" : []
    }

    ,
    {
        "_id" : ObjectId("5c25e1e824196d19231fbed3"),
        "title" : "appbee0627 한테만 보이는 활성화된 테스트",
        "description" : "targetUserIds에 추가해보았다",
        "subjectType" : "event",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.",
            "doing" : "아직 참여 진행중인데 끝내고 싶지 않니??? 얼른 끝내버리자아아앙 두줄두줄 두줄두줄",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "설문"
        ],
        "coverImageUrl" : "https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "iconImageUrl" : "https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "openDate" : ISODate("2018-12-28T00:00:00.000Z"),
        "closeDate" : ISODate("2119-12-31T00:00:00.000Z"),
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "참여보상(10명 추첨)",
                    "content" : "문화상품권 3000원",
                    "price": "3000",
                },
                {
                    "order" : 2,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 영웅(1명 선정)",
                    "content" : "영웅님의 닉네임으로 게임 내 NPC 제작은 길게 써보려고 해봤다능",
                }
            ]
        },
        "targetUserIds" : [
            config.testUser.userId
        ],
        "similarApps" : []
    },
    {
        "_id" : ObjectId("5c25e23b24196d19231fd1da"),
        "title" : "아직 오픈일이 되지 않은 테스트",
        "description" : "오픈되려면 멀었다",
        "subjectType" : "game-test",
        "plan" : "lite",
        "progressText" : {
            "ready" : "이거 완전 재밌는 게임인데....... 그냥 해보라고하면 할지 모르겠고... 설명을 못하겠네.... 정말 재밌는 게임인데...",
            "doing" : "진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중ㅍ",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "설문"
        ],
        "coverImageUrl" : "https://i.imgur.com/tVNahmV.jpg",
        "iconImageUrl" : "https://i.imgur.com/tVNahmV.jpg",
        "openDate" : ISODate("2119-12-30T00:00:00.000Z"),
        "closeDate" : ISODate("2119-12-31T00:00:00.000Z"),
        "similarApps" : []
    },
    {
        "_id" : ObjectId("5c7345f718500feddc24ca34"),
        "title" : "버그제보 & 리워드 없음 (ProgressText null)",
        "description" : "* 제보 기간 : 2/25(월) ~ 3/3(일)\n* 제보 방법 : 게임 플레이 시 발견되는 버그가 있을 때마다 이 카드를 통해 제보\n* 중요 버그 제보를 할 수록 테스트 영웅 수상의 가능성이 높아집니다!",
        "subjectType" : null,
        "progressText" : null,
        "tags" : [
            "버그제보"
        ],
        "coverImageUrl" : "https://i.imgur.com/5z0esWH.png",
        "iconImageUrl" : "https://i.imgur.com/5z0esWH.png",
        "openDate" : ISODate("2019-02-25T00:00:00.000Z"),
        "closeDate" : ISODate("2119-03-03T14:59:00.000Z"),
        "bugReport" : {
            "url" : "https://docs.google.com/forms/d/e/1FAIpQLSeApAn8oPp8mW6UT8RD1uMbKk_UvAiWBh5jwlxlyUUI4D2N1g/viewform?usp=pp_url&entry.455936817=",
            "completedUserIds" : [
                config.testUser.userId
            ]
        },
        "similarApps" : []
    },
    {
        "_id" : ObjectId("5c861f3f2917e70db5d2d536"),
        "title" : "포메스 우체통 (ProgressText없음)",
        "description" : "우체통임다",
        "subjectType" : null,
        "tags" : [],
        "coverImageUrl" : "https://i.imgur.com/n2MaXzg.png",
        "iconImageUrl" : "https://i.imgur.com/n2MaXzg.png",
        "openDate" : ISODate("2019-03-11T00:00:00.000Z"),
        "closeDate" : ISODate("2119-12-31T14:59:50.000Z"),
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "iconImageUrl" : "",
                    "title" : "참여자 전원",
                    "content" : "포메스의 사랑",
                }
            ]
        },
        "similarApps" : []
    }

    ,
    {
        "_id" : ObjectId("5c9892f92917e70db5d243dd"),
        "title" : "appbee0627이 타겟이 아닌 그룹",
        "description" : "targetUserIds 가 없어요",
        "subjectType" : "game-test",
        "plan" : "simple",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.........................................................................",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "coverImageUrl" : "https://i.imgur.com/6bmbTUV.jpg",
        "iconImageUrl" : "https://i.imgur.com/6bmbTUV.jpg",
        "openDate" : ISODate("2019-03-24T15:00:00.000Z"),
        "closeDate" : ISODate("2119-03-31T00:00:00.000Z"),
        "tags" : [
            "설문"
        ],
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "title" : "1테스트 요정 (전체지급)",
                    "content" : "문화상품권 1000원",
                    "price": "1000",
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                }
            ]
        },
        "targetUserIds" : [
            "abcd"
        ],
        "similarApps" : [
            ""
        ],
    },
    {
        "_id" : ObjectId("5c986adee1a6f20813ec464d"),
        "title" : "[메이헴의 유산] 게임 테스트 + 에필로그",
        "subjectType" : "game-test",
        "plan" : "standard",
        "progressText" : {
            "ready" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "coverImageUrl" : "",
        "iconImageUrl" : "https://i.imgur.com/4A0jfFe.jpg",
        "openDate" : ISODate("2019-03-21T15:00:00.000Z"),
        "closeDate" : ISODate("2019-03-23T00:00:00.000Z"),
        "tags" : [
            "설문"
        ],
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "title" : "1테스트 요정 (전체지급)",
                    "content" : "문화상품권 1000원",
                    "price": "1000",
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                }
            ]
        },
        "similarApps" : [],
        "epilogue" : {
            "awards" : "테스트 영웅 : 드래군핥짝 님\n테스트 요정 : 이브 외 9명",
            "deeplink" : "http://www.naver.com",
            "companySays" : "포메스 짱! 완전 짱! 대박! 완전! 완전! 두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄"
        }
    }
    ,
    {
        "_id" : ObjectId("5c989f0a2917e70db5d4fc2e"),
        "title" : "appbee0627이 참여한 그룹! + 에필로그  길게길게길게길게길게길게길게길게길게길게길게길게길게길게길게",
        "subjectType" : "game-test",
        "plan" : "lite",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "iconImageUrl" : "https://i.imgur.com/uSaMpey.jpg",
        "openDate" : ISODate("2019-03-21T15:00:00.000Z"),
        "closeDate" : ISODate("2019-03-26T00:00:00.000Z"),
        "tags" : [
            "설문"
        ],
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "title" : "1테스트 요정 (전체지급)",
                    "content" : "문화상품권 1000원",
                    "price": "1000",
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                }
            ]
        },
        "similarApps" : [],
        "epilogue" : {
            "awards" : "포메스 팀 : 참가자 여러분 모두 저희의 챔피언❤️",
            "deeplink" : "http://www.google.co.kr",
            "companySays" : "게임사 가라사대, 너희가 나를 살찌웠노라.... 고맙노라....."
        }
    },
    {
        "_id" : ObjectId("5c99d101d122450cf08431aa"),
        "title" : "appbee0627이 참여한 그룹! 근데 에필로그가 아직 등록안됨!!!!",
        "subjectType" : "game-test",
        "plan" : "lite",
        "progressText" : {
            "ready" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "doing" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "iconImageUrl" : "https://i.imgur.com/7886ojX.png",
        "openDate" : ISODate("2019-03-21T15:00:00.000Z"),
        "closeDate" : ISODate("2019-03-24T00:00:00.000Z"),
        "tags" : [
            "설문"
        ],
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "title" : "1테스트 요정 (전체지급)",
                    "content" : "문화상품권 1000원",
                    "price": "1000",
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                }
            ]
        },
        "similarApps" : [],
    },
    {
        "_id" : ObjectId("5c99d14fd122450cf08431ab"),
        "title" : "appbee0627이 참여하지 않은 그룹! 에필로그도 없음!",
        "subjectType" : "game-test",
        "plan" : "lite",
        "progressText" : {
            "ready" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "iconImageUrl" : "https://i.imgur.com/4oaQHWe.jpg",
        "openDate" : ISODate("2019-03-21T15:00:00.000Z"),
        "closeDate" : ISODate("2019-03-25T00:00:00.000Z"),
        "tags" : [
            "설문"
        ],
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "title" : "1테스트 요정 (전체지급)",
                    "content" : "문화상품권 1000원",
                    "price": "1000",
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                }
            ]
        },
        "similarApps" : [],
    },
    {
        "_id" : ObjectId("5ce51a069cb162da02b9f94d"),
        "title" : "테스트 추가 신청하기 (버그제보 있음)",
        "description" : "테스트 하고싶은 게임 추가신청을 할 수 있어여",
        "subjectType" : "game-test",
        "plan" : "standard",
        "purpose": "테스트 목적이무니다",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "설문fsagsgasdadddddj 아아아아 ㄴ나나나ㅏ",
            "태그다",
            "꿀잼"
        ],
        "coverImageUrl" : "https://i.imgur.com/n2MaXzg.png",
        "iconImageUrl" : "https://i.imgur.com/n2MaXzg.png",
        "openDate" : ISODate("2019-03-11T00:00:00.000Z"),
        "closeDate" : ISODate("2119-12-31T14:59:50.000Z"),
        "targetUserIds" : [
            "google110897406327517511196",
            config.testUser.userId
        ],
        "bugReport" : {
            "url" : "http://www.google.com",
            "completedUserIds" : []
        },
        "rewards" : {
            "minimumDelay" : 100,
            "list" : [
                {
                    "order" : 1,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "참여보상 (10명 추첨)",
                    "content" : "문화상품권 1000원",
                    "price": "1000",
                },
                {
                    "order" : 2,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 용사 (3명 선정)",
                    "content" : "문화상품권 3000원",
                    "price": "3000",
                },
                {
                    "order" : 3,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 영웅 (1명 선정)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                }
            ]
        },
        "similarApps" : []
    },
    {
        "_id" : ObjectId("5d01b1f6db7d04bc2d04345c"),
        "title" : "[매드러너] 게임 테스트",
        "subjectType" : "game-test",
        "plan" : "standard",
        "description" : "",
        "progressText" : {
            "ready" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "doing" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "설문"
        ],
        "coverImageUrl" : "https://i.imgur.com/oXFepuQ.jpg",
        "iconImageUrl" : "https://i.imgur.com/oXFepuQ.jpg",
        "openDate" : ISODate("2019-06-13T00:00:00.000Z"),
        "closeDate" : ISODate("2019-06-19T14:59:59.999Z"),
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "title" : "테스트 요정 (전체지급)",
                    "content" : "문화상품권 1000원",
                    "price": "1000",
                },
                {
                    "order" : 2,
                    "title" : "테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "price": "5000",
                }
            ]
        },
        "similarApps" : [],
        "isGroup" : true
    },
    {
        "_id" : ObjectId("1c861f3f2917e73db5d2d536"),
        "title" : "검색되지 말아야 하는 미션",
        "subjectType" : "event",
        "description" : "테스트 성 이니까",
        "status": "test",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.",
            "doing" : "조금만 더 힘내봐요 진행중중중",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [],
        "coverImageUrl" : "https://i.imgur.com/n2MaXzg.png",
        "iconImageUrl" : "https://i.imgur.com/n2MaXzg.png",
        "openDate" : ISODate("2019-03-11T00:00:00.000Z"),
        "closeDate" : ISODate("2119-12-31T14:59:50.000Z"),
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "iconImageUrl" : "",
                    "title" : "참여자 전원",
                    "content" : "포메스의 사랑",
                    "price" : 1000
                }
            ]
        },
        "similarApps" : []
    }
];

module.exports = data;
