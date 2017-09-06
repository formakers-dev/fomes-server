const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const statsRouter = require('./router/stats');
const appsRouter = require('./router/apps');
const userRouter = require('./router/user');
const db = require('./db');
const port = require('./config')[process.env.NODE_ENV].port;
const http = require('http');

db.init();

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.get('/', (req, res) => {
    res.send('hello world')
});

app.use('/user', userRouter);
app.use('/stats', statsRouter);
app.use('/apps', appsRouter);

app.use('/download', (req, res) => {
    if(req.param("os") === "ios") {
        res.redirect("https://appbee.info");
    } else {
        res.redirect("https://s3.ap-northeast-2.amazonaws.com/appbeepkg/release/appbee-beta.apk");
    }
});

http.createServer(app).listen(port, () => {
    console.log('Express App on http port ' + port);
});

// [https]
// const httpsPort = process.env.PORT || 8090;
// const https = require('https');
// const fs = require('fs');
// const credential = {
//     key: fs.readFileSync('appbee.key.pem'),
//     cert: fs.readFileSync('appbee.csr.pem')
// };
// https.createServer(credential, app).listen(httpsPort, () => {
//     console.log('Express App on https port ' + httpsPort);
// });
//
module.exports = app;