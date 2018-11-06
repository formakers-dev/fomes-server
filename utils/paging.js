const isValidPageAndLimit = (page, limit) => {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
        return false;
    } else if (pageNumber < 1 || limitNumber < 1) {
        return false;
    }

    return true;
};

module.exports = { isValidPageAndLimit };