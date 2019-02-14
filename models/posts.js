const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    order: Number,           // 순서 정렬용
    openDate: Date,             // 게시 시작일시
    closeDate : Date,              // 게시 종료일시
    coverImageUrl : String,     // 페이저 뷰에 쓰이는 이미지
    contents : String
});
module.exports = mongoose.model('posts', schema);