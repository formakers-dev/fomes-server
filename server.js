const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const statsRouter = require('./router/stats');
const appsRouter = require('./router/apps');
const userRouter = require('./router/user');
const projectRouter = require('./router/project');
const configurationRouter = require('./router/configurations');
const db = require('./db');
const port = require('./config').port;

db.init();

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.get('/', (req, res) => {
    res.send('Hello AppBee Mobile Server (' + process.env.NODE_ENV + ')');
});

app.use('/user', userRouter);
app.use('/stats', statsRouter);
app.use('/apps', appsRouter);
app.use('/projects', projectRouter);
app.use('/config', configurationRouter);

app.listen(port, () => {
    console.log('Express App on http port ' + port);
});

module.exports = app;