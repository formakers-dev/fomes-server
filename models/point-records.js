const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Constants = {
    TYPE: {
        SAVE: 1,
        EXCHANGE: 2,
    },
    STATUS: {
        COMPLETED: 99, // 완료
        REQUESTED: 10, // 요청 (운영팀에 요청하는 경우)
        // 예정?
    },
    OPERATION_STATUS: { //운영측 상태
        COMPLETED: 99,
        OPENED: 10,
        FAILED: -1
    },
    SAVE_POLICY: {
        UPDATE_USER: {
            POINT: 100,
            DESCRIPTION : '회원정보 수정 이벤트 참여'
        }
    }
};

const operationDataObject = {
    status: Number,
};

const schema = new Schema({
    userId: String,
    date: Date,
    point: Number,
    type: Number,
    status: Number,
    description: String,
    metaData: {
        betaTestId: ObjectId,
        awardRecordId: ObjectId,
        userInfoUpdateVersion: Number
    },
    operationData: {
        type: operationDataObject,
        required: false
    },

    // for exchange type
    phoneNumber: String,
});

const Model = mongoose.model('point-records', schema);

module.exports = {
    Model,
    Constants,
};
