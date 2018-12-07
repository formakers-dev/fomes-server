const sendError = (tag, userId, res, err, errCode) => {
    console.error(tag, "userId=", userId, "err=", err);
    res.status(errCode).json({
        success: false,
        message: err.message
    });
};

module.exports = { sendError };