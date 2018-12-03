const isValidPageAndLimit = (page, limit) => {
    if (isNaN(page) || isNaN(limit)) {
        return false;
    } else if (page < 1 || limit < 1) {
        return false;
    }

    return true;
};

const appendPagingQuery = (query, page, limit) => {
    if (page && limit) {
        return query.concat([{
            $skip: (page - 1) * limit
        }, {
            $limit: limit
        }]);
    } else {
        return query;
    }
};

module.exports = { isValidPageAndLimit, appendPagingQuery };