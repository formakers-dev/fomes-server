const mongoose = require('mongoose');
const config = require('../../config');

const ObjectId = mongoose.Types.ObjectId;
const ISODate = (ISODateString) => new Date(ISODateString);

const data = [
    {
        "_id": ObjectId("5d199927839927107f4bb940"),
        "betaTestId": ObjectId("5c25e1e824196d19231fbed3"),
        "order": 1,
        "title": "의견 작성",
        "description": "포메스에 대한 솔직한 의견 부탁드립니다.는 길게길게 써본다 크크크크킄 이렇게 길어질줄은 몰랐겠지? 하지만 한 미션안에 얼마나 들어갈지 모른다는 것이 함정! 과연 미션에는 얼마나 많은 글씨가 써질 수 있을 것인가????!!!!!",
        "descriptionImageUrl": "",
        "guide": "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.",
        "actionType": "link",
        "action": "https://www.naver.com"
    },
    {
        "_id": ObjectId("5d199913839927107f4bb93f"),
        "betaTestId": ObjectId("5c25c77798d78f078d8ef3ba"),
        "order": 3,
        "title": "의견 작성",
        "description": "포메스에 대한 솔직한 의견 부탁드립니다.",
        "descriptionImageUrl": "https://i.imgur.com/jkLkNSj.jpg",
        "guide": "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
        "actionType": "link",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?usp=pp_url&entry.1575991284="
    },
    {
        "_id": ObjectId("5d1d74d1d638af0bb86b0f6f"),
        "betaTestId": ObjectId("5c25c77798d78f078d8ef3ba"),
        "order": 5,
        "title": "의견 작성(앱내 웹뷰: actionType-internal_web)",
        "description": "포메스에 대한 솔직한 의견 부탁드립니다.",
        "descriptionImageUrl": "https://i.imgur.com/jkLkNSj.jpg",
        "guide": "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
        "actionType": "internal_web",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?usp=pp_url&entry.1575991284=",
    },
    {
        "_id": ObjectId("5d1d74d6d638af0bb86b0f70"),
        "betaTestId": ObjectId("5c25c77798d78f078d8ef3ba"),
        "order": 4,
        "title": "의견 작성(앱내 웹뷰: actionType-link)",
        "description": "포메스에 대한 솔직한 의견 부탁드립니다.",
        "descriptionImageUrl": "https://i.imgur.com/jkLkNSj.jpg",
        "guide": "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
        "actionType": "link",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?internal_web=true&usp=pp_url&entry.1575991284=",
    },
    {
        "_id": ObjectId("5d1998bb839927107f4bb93e"),
        "betaTestId": ObjectId("5c25c77798d78f078d8ef3ba"),
        "order": 2,
        "title": "게임 플레이",
        "description": "포메스를 자유롭게 이용해주세요!",
        "descriptionImageUrl": "https://i.imgur.com/qYZtGrq.jpg",
        "guide": "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
        "actionType": "link",
        "action": "",
        "type": "play",
        "packageName": "com.formakers.fomes",
    },
    {
        "_id": ObjectId("5d1998bb839927107f4bb931"),
        "betaTestId": ObjectId("5c25c77798d78f078d8ef3ba"),
        "order": 1,
        "title": "게임 다운로드 하기",
        "description": "포메스를 자유롭게 이용해주세요!",
        "descriptionImageUrl": "https://i.imgur.com/qYZtGrq.jpg",
        "guide": "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
        "actionType": "link",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLSe17_zvBmDWR1T-HvMPtUYg50XIL8bhdTFCLnT23lfS4QtvXg/viewform?usp=pp_url&entry.1575991284="
    },
    {
        "_id": ObjectId("5d19996f839927107f4bb941"),
        "betaTestId": ObjectId("5c25e23b24196d19231fd1da"),
        "order": 1,
        "title": "의견 작성",
        "description": "",
        "descriptionImageUrl": "",
        "guide": "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.",
        "actionType": "link",
        "action": "https://www.naver.com",
    },
    {
        "_id": ObjectId("5d199a0b839927107f4bb942"),
        "betaTestId": ObjectId("5c7345f718500feddc24ca34"),
        "order": 1,
        "title": "의견 작성",
        "description": "",
        "descriptionImageUrl": "",
        "guide": "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.",
        "actionType": "link",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLSeApAn8oPp8mW6UT8RD1uMbKk_UvAiWBh5jwlxlyUUI4D2N1g/viewform?usp=pp_url&entry.455936817=",
    },
    {
        "_id": ObjectId("5d199a13839927107f4bb943"),
        "betaTestId": ObjectId("5c7345f718500feddc24ca34"),
        "order": 2,
        "title": "로그인이 필요한 설문",
        "description": "",
        "descriptionImageUrl": "",
        "guide": "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.",
        "actionType": "link",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLScX_8AfhRa9Fc17p2DZdVbMHCA98DY_TlShowgfoNqbx25q9g/viewform?internal_web=true&usp=pp_url&entry.1223559684=",
    },
    {
        "_id": ObjectId("5d199a13839927107f4bb949"),
        "betaTestId": ObjectId("5c7345f718500feddc24ca34"),
        "order": 3,
        "title": "로그인이 필요한 설문",
        "description": "",
        "descriptionImageUrl": "",
        "guide": "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.",
        "type": "hidden",
        "actionType": "link",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLScX_8AfhRa9Fc17p2DZdVbMHCA98DY_TlShowgfoNqbx25q9g/viewform?internal_web=true&usp=pp_url&entry.1223559684=",
    },
    {
        "_id": ObjectId("5d199a2c839927107f4bb944"),
        "betaTestId": ObjectId("5c861f3f2917e70db5d2d536"),
        "order": 1,
        "title": "편지 보내기",
        "description": "포메스에게 하고 싶은 말이 있다면 이 카드를 통해 편지를 작성해주세요.\n* 불편함, 칭찬, 아이디어 모두 환영이에요.",
        "descriptionUrl": "",
        "guide": "* 정성가득~~~~~~~~~~~ 아름다운 세상~~~~~~~~~~~~~~~~~~~~~~~~",
        "action": "http://www.naver.com"
    },
    {
        "_id": ObjectId("5d199a3b839927107f4bb945"),
        "betaTestId": ObjectId("5c9892f92917e70db5d243dd"),
        "order": 1,
        "title": "테스트 아이템 1",
        "description": "미션1이에요",
        "descriptionImageUrl": "descriptionImageUrl1",
        "guide": "guide1",
        "actionType": "link",
        "action": "https://www.google.com",
        "type": "play",
        "packageName": "packageName1"
    },
    {
        "_id": ObjectId("5d199a4b839927107f4bb946"),
        "betaTestId": ObjectId("5c986adee1a6f20813ec464d"),
        "order": 1,
        "title": "테스트 아이템 1",
        "description": "targetUserIds 가 없어요",
        "descriptionImageUrl": "descriptionImageUrl1",
        "guide": "guide1",
        "actionType": "link",
        "action": "https://www.google.com",
        "options": ["recheckable"],
        "type": "play",
        "packageName": "packageName1"
    },
    {
        "_id": ObjectId("5d199a58839927107f4bb947"),
        "betaTestId": ObjectId("5c989f0a2917e70db5d4fc2e"),
        "order": 1,
        "title": "테스트 아이템 1",
        "description": "미션1ㅇ입니다",
        "descriptionImageUrl": "descriptionImageUrl1",
        "guide": "guide1",
        "actionType": "link",
        "action": "https://www.google.com",
        "type": "play",
        "packageName": "packageName1",
    },
    {
        "_id": ObjectId("5d199a84839927107f4bb949"),
        "betaTestId": ObjectId("5c99d101d122450cf08431aa"),
        "order": 1,
        "title": "테스트 아이템 1",
        "description": "targetUserIds 가 없어요",
        "descriptionImageUrl": "descriptionImageUrl1",
        "guide": "guide1",
        "actionType": "link",
        "action": "https://www.google.com",
        "type": "play",
        "packageName": "packageName1",
    },
    {
        "_id": ObjectId("5d199a78839927107f4bb948"),
        "betaTestId": ObjectId("5c99d14fd122450cf08431ab"),
        "order": 1,
        "title": "테스트 아이템 1",
        "description": "targetUserIds 가 없어요",
        "descriptionImageUrl": "descriptionImageUrl1",
        "guide": "guide1",
        "actionType": "link",
        "action": "https://www.google.com",
        "type": "play",
        "packageName": "packageName1",
    },
    {
        "_id": ObjectId("5d199a97839927107f4bb94a"),
        "betaTestId": ObjectId("5ce51a069cb162da02b9f94d"),
        "order": 1,
        "title": "신청하기",
        "description": "테스트를 신청하라!!!!\n테스트 하고 싶은 게임 골라라아아아아ㅏ아",
        "descriptionImageUrl": "https://i.imgur.com/n2MaXzg.png",
        "actionType": "link",
        "action": "https://docs.google.com/forms/d/e/1FAIpQLSdxI2s694nLTVk4i7RMkkrtr-K_0s7pSKfUnRusr7348nQpJg/viewform?usp=pp_url&entry.1042588232=",
        "options": ['repeatable', 'mandatory']
    },
    {
        "_id": ObjectId("5d199aa0839927107f4bb94b"),
        "betaTestId": ObjectId("5ce51a069cb162da02b9f94d"),
        "order": 2,
        "title": "게임 플레이",
        "description": "게임을 10분 이상 플레이하라!!!!!!!",
        "descriptionImageUrl": "",
        "guide": "* 위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
        "action": "https://play.google.com/store/apps/details?id=com.frozax.tentsandtrees",
        "type": "play",
        "packageName": "com.frozax.tentsandtrees"
    },
    {
        "_id": ObjectId("5d199ab3839927107f4bb94d"),
        "betaTestId": ObjectId("5ce51a069cb162da02b9f94d"),
        "order": 3,
        "title": "의견 작성2",
        "description": "설문을 하라!!!!!!!!!!!",
        "descriptionImageUrl": "",
        "guide": "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.",
        "action": "https://www.naver.com",
    },
    {
        "_id": ObjectId("5d199aaa839927107f4bb94c"),
        "betaTestId": ObjectId("5ce51a069cb162da02b9f94d"),
        "order": 4,
        "title": "의견 작성",
        "description": "설문을 하라!!!!!!!!!!!",
        "descriptionImageUrl": "",
        "guide": "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다.",
        "action": "https://www.naver.com",
    },
    {
        "_id" : ObjectId("5d199ac3839927107f4bb94e"),
        "betaTestId": ObjectId("5d01b1f6db7d04bc2d04345c"),
        "order" : 1,
        "title" : "게임 플레이",
        "description" : "💘 포메스 유저 픽! 박진감 넘치는 극강 난이도 런게임을 즐겨보자!",
        "descriptionImageUrl" : "",
        "guide" : "위 버튼을 누르면, 테스트 대상 게임 무단배포 금지에 동의로 간주합니다.",
        "actionType" : "link",
        "action" : "https://play.google.com/store/apps/details?id=com.Obliqueline.MadRunnerKo&email=",
        "type": "play",
        "packageName" : "com.Obliqueline.MadRunnerKo"
    },
    {
        "_id" : ObjectId("5d199acb839927107f4bb94f"),
        "betaTestId": ObjectId("5d01b1f6db7d04bc2d04345c"),
        "order" : 2,
        "title" : "의견 작성",
        "description" : "게임에 대한 의견을 자유롭게 남겨주세요.",
        "descriptionImageUrl" : "",
        "actionType" : "link",
        "action" : "https://docs.google.com/forms/d/e/1FAIpQLSeRI99bYe7LUU0iQgVMKev6D4zyaW2E3zKx-Tp1tVW2Qzv0Cg/viewform?internal_web=true&usp=pp_url&entry.394653407=",
        "options": ["recheckable"],
        "guide" : "* 솔직하고 구체적으로 의견을 적어주시는게 제일 중요합니다!\n* 불성실한 응답은 보상지급 대상자에서 제외될 수 있습니다."
    },
    {
        "_id" : ObjectId("3d199a2c839927107f4bb944"),
        "betaTestId":  ObjectId("1c861f3f2917e73db5d2d536"),
        "order" : 1,
        "title" : "편지 보내기",
        "description" : "포메스에게 하고 싶은 말이 있다면 이 카드를 통해 편지를 작성해주세요.\n* 불편함, 칭찬, 아이디어 모두 환영이에요.",
        "descriptionUrl" : "",
        "guide" : "* 정성가득~~~~~~~~~~~ 아름다운 세상~~~~~~~~~~~~~~~~~~~~~~~~",
        "action" : "http://www.naver.com",
    }
];

module.exports = data;