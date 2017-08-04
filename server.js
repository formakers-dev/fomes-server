const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const statsRouter = require('./router/stats');
const appsRouter = require('./router/apps');
const userRouter = require('./router/user');
const Auth = require('./middleware/auth');
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
app.use('/stats', Auth.appBeeTokenVerifier, statsRouter);
app.use('/apps', Auth.appBeeTokenVerifier, appsRouter);

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