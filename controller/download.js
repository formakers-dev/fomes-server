let DownloadHistories = require('./../models/downloadHistories');

let insertDownloadHistory = (req, res) => {

    let downloadHistory = new DownloadHistories({
        userId : req.query.referer
    });

    downloadHistory.save(() => {
        res.redirect("https://s3.ap-northeast-2.amazonaws.com/appbeepkg/release/appbee-beta.apk");
    });
};

module.exports = {insertDownloadHistory};