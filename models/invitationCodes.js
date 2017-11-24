const mongoose = require('mongoose');
const invitationCodesSchema = new mongoose.Schema({
    code: String
});
const invitationCodes = mongoose.model('invitation-codes', invitationCodesSchema);
module.exports = invitationCodes;