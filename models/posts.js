const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    order: Number,              // 순서 정렬용
    openDate: Date,             // 게시 시작일시
    closeDate : Date,           // 게시 종료일시
    title: String,              // 타이틀 (상세페이지에서 액션바에 뜨는 제목)
    coverImageUrl : String,     // 페이저 뷰에 쓰이는 이미지

    // 우선순위 : deeplink > contents
    contents : String,          // internal web (HTML or link)
    deeplink: String,           // URI
});
module.exports = mongoose.model('posts', schema);
