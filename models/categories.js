const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    id : String,
    title : String,
});

const parentCategories = {
    '/store/apps/category/GAME': '게임',
    '/store/apps/category/KIDS': '키즈',
};

const category = mongoose.model('categories', categoriesSchema);
module.exports = { category, parentCategories };