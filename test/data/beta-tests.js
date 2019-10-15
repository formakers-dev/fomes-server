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
        "progressText" : {
            "ready" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "플레이"
        ],
        "overviewImageUrl" : "https://images.pexels.com/photos/669609/pexels-photo-669609.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&h=500&w=500",
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
                    "userIds" : [ 'user1', 'user2']
                },
                {
                    "order" : 2,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 용사(3명 선정)",
                    "content" : "문화상품권 5000원",
                    "userIds" : []
                },
                {
                    "order" : 3,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 영웅(1명 선정)",
                    "content" : "문화상품권 10000원",
                    "userIds" : ['user3']
                }
            ]
        },
        "missions" : [
            {
                "order" : 2,
                "title" : "설문 참여",
                "description" : "포메스에 대한 솔직한 의견 부탁드립니다.",
                "descriptionImageUrl" : "https://i.imgur.com/jkLkNSj.jpg",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "order" : 1,
                        "title" : "의견 작성",
                        "actionType" : "link",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?usp=pp_url&entry.1575991284=",
                        "completedUserIds" : [
                            "google115909938647516500511",
                            config.testUser.userId
                        ],
                        "_id" : ObjectId("5d199913839927107f4bb93f")
                    },
                    {
                        "order" : 3,
                        "title" : "의견 작성(앱내 웹뷰: actionType-internal_web)",
                        "actionType" : "internal_web",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?usp=pp_url&entry.1575991284=",
                        "completedUserIds" : [
                            "google115909938647516500511"
                        ],
                        "_id" : ObjectId("5d1d74d1d638af0bb86b0f6f")
                    },
                    {
                        "order" : 2,
                        "title" : "의견 작성(앱내 웹뷰: actionType-link)",
                        "actionType" : "link",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?internal_web=true&usp=pp_url&entry.1575991284=",
                        "completedUserIds" : [
                            "google115909938647516500511",
                        ],
                        "_id" : ObjectId("5d1d74d6d638af0bb86b0f70")
                    }
                ],
                "guide" : "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
                "_id" : ObjectId("5d1d6be5d638af0bb86b0f6d")
            },
            {
                "order" : 1,
                "title" : "게임 플레이",
                "description" : "포메스를 자유롭게 이용해주세요!",
                "descriptionImageUrl" : "https://i.imgur.com/qYZtGrq.jpg",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "order" : 2,
                        "type" : "play",
                        "title" : "게임 플레이",
                        "actionType" : "link",
                        "action" : "",
                        "postCondition" : {
                            "packageName" : "com.formakers.fomes",
                            "playTime" : 1800000
                        },
                        "completedUserIds" : [
                            "google115909938647516500511",
                            "google115838807161306170827",
                            config.testUser.userId
                        ],
                        "_id" : ObjectId("5d1998bb839927107f4bb93e")
                    },
                    {
                        "order" : 1,
                        "title" : "게임 다운로드 하기",
                        "actionType" : "link",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?usp=pp_url&entry.1575991284=",
                        "completedUserIds" : [
                            "google115909938647516500511"
                        ],
                        "_id" : ObjectId("5d1998bb839927107f4bb931")
                    }
                ],
                "guide" : "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
                "_id" : ObjectId("5d1d6bf2d638af0bb86b0f6e")
            }
        ],
        "apps" : []
    }

    ,
    {
        "_id" : ObjectId("5c25e1e824196d19231fbed3"),
        "title" : "appbee0627 한테만 보이는 활성화된 테스트",
        "description" : "targetUserIds에 추가해보았다",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.",
            "doing" : "아직 참여 진행중인데 끝내고 싶지 않니??? 얼른 끝내버리자아아앙 두줄두줄 두줄두줄",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "설문"
        ],
        "overviewImageUrl" : "https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
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
                    "userIds" : ['user1']
                },
                {
                    "order" : 2,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 영웅(1명 선정)",
                    "content" : "영웅님의 닉네임으로 게임 내 NPC 제작은 길게 써보려고 해봤다능",
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "설문 참여",
                "description" : "포메스에 대한 솔직한 의견 부탁드립니다.는 길게길게 써본다 크크크크킄 이렇게 길어질줄은 몰랐겠지? 하지만 한 미션안에 얼마나 들어갈지 모른다는 것이 함정! 과연 미션에는 얼마나 많은 글씨가 써질 수 있을 것인가????!!!!!",
                "descriptionImageUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "title" : "의견 작성",
                        "_id" : ObjectId("5d199927839927107f4bb940"),
                        "actionType" : "link",
                        "action" : "https://www.naver.com",
                        "completedUserIds" : []
                    }
                ],
                "guide" : "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다."
            }
        ],
        "targetUserIds" : [
            config.testUser.userId
        ],
        "apps" : []
    }

    ,
    {
        "_id" : ObjectId("5c25e23b24196d19231fd1da"),
        "title" : "아직 오픈일이 되지 않은 테스트",
        "description" : "오픈되려면 멀었다",
        "progressText" : {
            "ready" : "이거 완전 재밌는 게임인데....... 그냥 해보라고하면 할지 모르겠고... 설명을 못하겠네.... 정말 재밌는 게임인데...",
            "doing" : "진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중진행중ㅍ",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "설문"
        ],
        "overviewImageUrl" : "https://i.imgur.com/tVNahmV.jpg",
        "iconImageUrl" : "https://i.imgur.com/tVNahmV.jpg",
        "openDate" : ISODate("2119-12-30T00:00:00.000Z"),
        "closeDate" : ISODate("2119-12-31T00:00:00.000Z"),
        "missions" : [
            {
                "order" : 1,
                "title" : "설문 참여",
                "description" : "",
                "descriptionImageUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "title" : "의견 작성",
                        "_id" : ObjectId("5d19996f839927107f4bb941"),
                        "actionType" : "link",
                        "action" : "https://www.naver.com",
                        "completedUserIds" : []
                    }
                ],
                "guide" : "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다."
            }
        ],
        "apps" : []
    }

    ,
    {
        "_id" : ObjectId("5c7345f718500feddc24ca34"),
        "title" : "버그제보 & 리워드 없음",
        "description" : "* 제보 기간 : 2/25(월) ~ 3/3(일)\n* 제보 방법 : 게임 플레이 시 발견되는 버그가 있을 때마다 이 카드를 통해 제보\n* 중요 버그 제보를 할 수록 테스트 영웅 수상의 가능성이 높아집니다!",
        "progressText" : {
            "ready" : "아직도 안해본 사람이 있다고요???",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요??????????????????????????????????????????????",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "버그제보"
        ],
        "overviewImageUrl" : "https://i.imgur.com/5z0esWH.png",
        "iconImageUrl" : "https://i.imgur.com/5z0esWH.png",
        "openDate" : ISODate("2019-02-25T00:00:00.000Z"),
        "closeDate" : ISODate("2119-03-03T14:59:00.000Z"),
        "bugReport" : {
            "url" : "https://docs.google.com/forms/d/e/1FAIpQLSeApAn8oPp8mW6UT8RD1uMbKk_UvAiWBh5jwlxlyUUI4D2N1g/viewform?usp=pp_url&entry.455936817=",
            "completedUserIds" : [
                config.testUser.userId
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "버그 제보",
                "description" : "",
                "descriptionImageUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "title" : "의견 작성",
                        "_id" : ObjectId("5d199a0b839927107f4bb942"),
                        "actionType" : "link",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSeApAn8oPp8mW6UT8RD1uMbKk_UvAiWBh5jwlxlyUUI4D2N1g/viewform?usp=pp_url&entry.455936817=",
                        "completedUserIds" : [
                            config.testUser.userId
                        ]
                    },
                    {
                        "title" : "로그인이 필요한 설문",
                        "_id" : ObjectId("5d199a13839927107f4bb943"),
                        "actionType" : "link",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLScX_8AfhRa9Fc17p2DZdVbMHCA98DY_TlShowgfoNqbx25q9g/viewform?internal_web=true&usp=pp_url&entry.1223559684=",
                        "completedUserIds" : [
                            config.testUser.userId
                        ]
                    }
                ],
                "guide" : "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다."
            }
        ],
        "apps" : []
    }

    ,
    {
        "_id" : ObjectId("5c861f3f2917e70db5d2d536"),
        "title" : "포메스 우체통",
        "description" : "우체통임다",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.",
            "doing" : "조금만 더 힘내봐요 진행중중중",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [],
        "overviewImageUrl" : "https://i.imgur.com/n2MaXzg.png",
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
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "우체통 미션 타이틀!",
                "description" : "포메스에게 하고 싶은 말이 있다면 이 카드를 통해 편지를 작성해주세요.\n* 불편함, 칭찬, 아이디어 모두 환영이에요.",
                "descriptionUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "title" : "편지 보내기",
                        "action" : "http://www.naver.com",
                        "completedUserIds" : [],
                        "_id" : ObjectId("5d199a2c839927107f4bb944")
                    }
                ],
                "guide" : "* 정성가득~~~~~~~~~~~ 아름다운 세상~~~~~~~~~~~~~~~~~~~~~~~~"
            }
        ],
        "apps" : []
    }

    ,
    {
        "_id" : ObjectId("5c9892f92917e70db5d243dd"),
        "title" : "appbee0627이 타겟이 아닌 그룹",
        "description" : "targetUserIds 가 없어요",
        "progressText" : {
            "ready" : "망설여지나요? 어렵지 않으니 일단 시작해봐요 우리.........................................................................",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "굿! 훌륭해요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "overviewImageUrl" : "https://i.imgur.com/6bmbTUV.jpg",
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
                    "userIds" : []
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "userIds" : ['user10']
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "미션1",
                "description" : "미션1이에요",
                "descriptionImageUrl" : "descriptionImageUrl1",
                "iconImageUrl" : "iconImageUrl1",
                "tags" : [
                    "1:1",
                    "인터뷰"
                ],
                "items" : [
                    {
                        "title" : "테스트 아이템 1",
                        "_id" : ObjectId("5d199a3b839927107f4bb945"),
                        "actionType" : "link",
                        "action" : "https://www.google.com",
                        "postCondition" : {
                            "packageName" : "packageName1",
                            "playTime" : 1000
                        },
                        "completedUserIds" : []
                    }
                ],
                "guide" : "guide1"
            }
        ],
        "targetUserIds" : [
            "abcd"
        ],
        "apps" : [
            ""
        ],
        "isGroup" : true
    }

    ,
    {
        "_id" : ObjectId("5c986adee1a6f20813ec464d"),
        "title" : "[메이헴의 유산] 게임 테스트 + 에필로그",
        "progressText" : {
            "ready" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "doing" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "overviewImageUrl" : "",
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
                    "userIds" : []
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "미션1",
                "description" : "targetUserIds 가 없어요",
                "descriptionImageUrl" : "descriptionImageUrl1",
                "iconImageUrl" : "iconImageUrl1",
                "tags" : [
                    "1:1",
                    "인터뷰"
                ],
                "items" : [
                    {
                        "title" : "테스트 아이템 1",
                        "actionType" : "link",
                        "action" : "https://www.google.com",
                        "postCondition" : {
                            "packageName" : "packageName1",
                            "playTime" : 1000
                        },
                        "completedUserIds" : [],
                        "_id" : ObjectId("5d199a4b839927107f4bb946")
                    }
                ],
                "guide" : "guide1"
            }
        ],
        "apps" : [],
        "isGroup" : true,
        "afterService" : {
            "awards" : "테스트 영웅 : 드래군핥짝 님\n테스트 요정 : 이브 외 9명",
            "epilogue" : "http://www.naver.com",
            "companySays" : "포메스 짱! 완전 짱! 대박! 완전! 완전! 두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄두줄"
        }
    }

    ,
    {
        "_id" : ObjectId("5c989f0a2917e70db5d4fc2e"),
        "title" : "appbee0627이 참여한 그룹! + 에필로그  길게길게길게길게길게길게길게길게길게길게길게길게길게길게길게",
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
                    "userIds" : []
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "미션1",
                "description" : "미션1ㅇ입니다",
                "descriptionImageUrl" : "descriptionImageUrl1",
                "iconImageUrl" : "iconImageUrl1",
                "tags" : [
                    "1:1",
                    "인터뷰"
                ],
                "items" : [
                    {
                        "title" : "테스트 아이템 1",
                        "actionType" : "link",
                        "action" : "https://www.google.com",
                        "postCondition" : {
                            "packageName" : "packageName1",
                            "playTime" : 1000
                        },
                        "completedUserIds" : [
                            config.testUser.userId
                        ],
                        "_id" : ObjectId("5d199a58839927107f4bb947")
                    }
                ],
                "guide" : "guide1"
            }
        ],
        "apps" : [],
        "isGroup" : true,
        "afterService" : {
            "awards" : "포메스 팀 : 참가자 여러분 모두 저희의 챔피언❤️",
            "epilogue" : "http://www.google.co.kr",
            "companySays" : "게임사 가라사대, 너희가 나를 살찌웠노라.... 고맙노라....."
        }
    }

    ,
    {
        "_id" : ObjectId("5c99d101d122450cf08431aa"),
        "title" : "appbee0627이 참여한 그룹! 근데 에필로그가 아직 등록안됨!!!!",
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
                    "userIds" : []
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "미션1",
                "description" : "targetUserIds 가 없어요",
                "descriptionImageUrl" : "descriptionImageUrl1",
                "iconImageUrl" : "iconImageUrl1",
                "tags" : [
                    "1:1",
                    "인터뷰"
                ],
                "items" : [
                    {
                        "title" : "테스트 아이템 1",
                        "actionType" : "link",
                        "action" : "https://www.google.com",
                        "postCondition" : {
                            "packageName" : "packageName1",
                            "playTime" : 1000
                        },
                        "completedUserIds" : [
                            config.testUser.userId
                        ],
                        "_id" : ObjectId("5d199a84839927107f4bb949")
                    }
                ],
                "guide" : "guide1"
            }
        ],
        "apps" : [],
        "isGroup" : true
    }

    ,
    {
        "_id" : ObjectId("5c99d14fd122450cf08431ab"),
        "title" : "appbee0627이 참여하지 않은 그룹! 에필로그도 없음!",
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
                    "userIds" : []
                },
                {
                    "order" : 2,
                    "title" : "1테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "미션1",
                "description" : "targetUserIds 가 없어요",
                "descriptionImageUrl" : "descriptionImageUrl1",
                "iconImageUrl" : "iconImageUrl1",
                "tags" : [
                    "1:1",
                    "인터뷰"
                ],
                "items" : [
                    {
                        "title" : "테스트 아이템 1",
                        "actionType" : "link",
                        "action" : "https://www.google.com",
                        "postCondition" : {
                            "packageName" : "packageName1",
                            "playTime" : 1000
                        },
                        "completedUserIds" : [],
                        "_id" : ObjectId("5d199a78839927107f4bb948")
                    }
                ],
                "guide" : "guide1"
            }
        ],
        "apps" : [],
        "isGroup" : true
    }

    ,
    {
        "_id" : ObjectId("5ce51a069cb162da02b9f94d"),
        "title" : "테스트 추가 신청하기 (버그제보 있음)",
        "description" : "테스트 하고싶은 게임 추가신청을 할 수 있어여",
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
        "overviewImageUrl" : "https://i.imgur.com/n2MaXzg.png",
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
                    "userIds" : []
                },
                {
                    "order" : 2,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 용사 (3명 선정)",
                    "content" : "문화상품권 3000원",
                    "userIds" : []
                },
                {
                    "order" : 3,
                    "iconImageUrl" : "http://icons.iconarchive.com/icons/icons-land/metro-raster-sport/256/Medal-icon.png",
                    "title" : "테스트 영웅 (1명 선정)",
                    "content" : "문화상품권 5000원",
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "베타테스트 추가 신청하기",
                "description" : "테스트를 신청하라!!!!\n테스트 하고 싶은 게임 골라라아아아아ㅏ아",
                "descriptionImageUrl" : "https://i.imgur.com/n2MaXzg.png",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "order": 1,
                        "title" : "신청하기",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSdxI2s694nLTVk4i7RMkkrtr-K_0s7pSKfUnRusr7348nQpJg/viewform?usp=pp_url&entry.1042588232=",
                        "completedUserIds" : [
                            config.testUser.userId
                        ],
                        "_id" : ObjectId("5d199a97839927107f4bb94a"),
                        "options" : ['repeatable', 'mandatory']
                    }
                ]
            },
            {
                "order" : 2,
                "title" : "첫번째 미션!!!",
                "description" : "게임을 10분 이상 플레이하라!!!!!!!",
                "descriptionImageUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "order" : 1,
                        "title" : "게임 플레이",
                        "action" : "https://play.google.com/store/apps/details?id=com.frozax.tentsandtrees",
                        "postCondition" : {
                            "packageName" : "com.frozax.tentsandtrees",
                            "playTime" : 600000
                        },
                        "completedUserIds" : [
                            config.testUser.userId
                        ],
                        "_id" : ObjectId("5d199aa0839927107f4bb94b")
                    }
                ],
                "guide" : "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다."
            },
            {
                "order" : 3,
                "title" : "두번째 미션!!!",
                "description" : "설문을 하라!!!!!!!!!!!",
                "descriptionImageUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "order": 2,
                        "title" : "의견 작성",
                        "action" : "https://www.naver.com",
                        "completedUserIds" : [],
                        "_id" : ObjectId("5d199aaa839927107f4bb94c")
                    },
                    {
                        "order": 1,
                        "title" : "의견 작성2",
                        "action" : "https://www.naver.com",
                        "completedUserIds" : [],
                        "_id" : ObjectId("5d199ab3839927107f4bb94d")
                    }
                ],
                "guide" : "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다."
            }
        ],
        "apps" : []
    }

    ,
    {
        "_id" : ObjectId("5d01b1f6db7d04bc2d04345c"),
        "title" : "[매드러너] 게임 테스트",
        "description" : "",
        "progressText" : {
            "ready" : "당신을 기다리고 있었어요! 이어서 참여해볼까요?",
            "doing" : "밑져야 본전! 재미있어 보인다면 참여해 보세요.",
            "done" : "짝짝짝! 멋져요! 마감 후 테스터 시상식이 열릴거에요."
        },
        "tags" : [
            "설문"
        ],
        "overviewImageUrl" : "https://i.imgur.com/oXFepuQ.jpg",
        "iconImageUrl" : "https://i.imgur.com/oXFepuQ.jpg",
        "openDate" : ISODate("2019-06-13T00:00:00.000Z"),
        "closeDate" : ISODate("2019-06-19T14:59:59.999Z"),
        "rewards" : {
            "list" : [
                {
                    "order" : 1,
                    "title" : "테스트 요정 (전체지급)",
                    "content" : "문화상품권 1000원",
                    "userIds" : []
                },
                {
                    "order" : 2,
                    "title" : "테스트 영웅 (1명)",
                    "content" : "문화상품권 5000원",
                    "userIds" : []
                }
            ]
        },
        "missions" : [
            {
                "order" : 1,
                "title" : "게임 플레이",
                "description" : "💘 포메스 유저 픽! 박진감 넘치는 극강 난이도 런게임을 즐겨보자!",
                "descriptionImageUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "title" : "게임 플레이",
                        "_id" : ObjectId("5d199ac3839927107f4bb94e"),
                        "actionType" : "link",
                        "action" : "https://play.google.com/store/apps/details?id=com.Obliqueline.MadRunnerKo&email=",
                        "postCondition" : {
                            "packageName" : "com.Obliqueline.MadRunnerKo",
                            "playTime" : 1800000
                        },
                        "completedUserIds" : [
                            "google109475593158230915340",
                            "google110373277273470774582",
                            "google112624873226930981786",
                            "google117300467789568490682",
                            "google101880983453541247345",
                            "google104451659553773678959",
                            "google109194994469517820690",
                            "google107983760581344134296",
                            "google103868789060875488905",
                            "google118003545878522554090",
                            "google110115843151562249179",
                            "google105202439953340394900",
                            "google117625570877850551868",
                            config.testUser.userId
                        ]
                    }
                ],
                "guide" : "위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다."
            },
            {
                "order" : 2,
                "title" : "설문 참여",
                "description" : "게임에 대한 의견을 자유롭게 남겨주세요.",
                "descriptionImageUrl" : "",
                "iconImageUrl" : "https://cdn1.iconfinder.com/data/icons/e-commerce-categories/54/Games-512.png",
                "items" : [
                    {
                        "title" : "의견 작성",
                        "actionType" : "link",
                        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSeRI99bYe7LUU0iQgVMKev6D4zyaW2E3zKx-Tp1tVW2Qzv0Cg/viewform?internal_web=true&usp=pp_url&entry.394653407=",
                        "completedUserIds" : [
                            "google109475593158230915340",
                            "google110373277273470774582",
                            "google112624873226930981786",
                            "google117300467789568490682",
                            "google101880983453541247345",
                            "google104451659553773678959",
                            "google109194994469517820690",
                            "google107983760581344134296",
                            "google103868789060875488905",
                            "google118003545878522554090",
                            "google110115843151562249179",
                            "google105202439953340394900",
                            "google117625570877850551868",
                            config.testUser.userId
                        ],
                        "_id" : ObjectId("5d199acb839927107f4bb94f")
                    }
                ],
                "guide" : "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다."
            }
        ],
        "apps" : [],
        "isGroup" : true
    }
];

module.exports = data;