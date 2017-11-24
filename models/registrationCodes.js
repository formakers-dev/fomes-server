const mongoose = require('mongoose');
const registrationCodesSchema = new mongoose.Schema({
    code: String
});
const registrationCodes = mongoose.model('registration-codes', registrationCodesSchema);
module.exports = registrationCodes;