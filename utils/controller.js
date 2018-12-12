const convertErrorToJson = (tag, userId, err) => {
    console.error(tag, "userId=", userId, "err=", err);

    return {
        success: false,
        message: err.message
    };
};

module.exports = { convertErrorToJson };