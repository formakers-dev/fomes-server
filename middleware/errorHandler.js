const Boom = require('boom');

const logError = (err, req, res, next) => {
    console.error('[', new Date(), '] userId=', req.userId, ', stackTrace=' + err.stack);
    next(err);
};

const handleError = (err, req, res, next) => {
    res.status(Boom.isBoom(err) ? err.output.statusCode : 500)
        .json({
            success: false,
            message: err.message
        });
};

module.exports = {logError, handleError};