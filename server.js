const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const statsRouter = require('./router/stats');
const appsRouter = require('./router/apps');
const userRouter = require('./router/user');
const downloadRouter = require('./router/download');
const projectRouter = require('./router/project');
const db = require('./db');
const port = require('./config').port;
const http = require('http');

db.init();

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.get('/', (req, res) => {
    res.send('Hello AppBee')
});

app.use('/user', userRouter);
app.use('/stats', statsRouter);
app.use('/apps', appsRouter);
app.use('/download', downloadRouter);
app.use('/project', projectRouter);

http.createServer(app).listen(port, () => {
    console.log('Express App on http port ' + port);
});

module.exports = app;