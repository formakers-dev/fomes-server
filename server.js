const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const packagejson = require('./package.json');
const statsRouter = require('./router/stats');
const usersRouter = require('./router/users');
const appsRouter = require('./router/apps');
const configurationRouter = require('./router/configurations');
const recommendRouter = require('./router/recommend');
const requestsRouter = require('./router/requests');
const {logError, handleError} = require('./middleware/errorHandler');
const db = require('./db');
const port = require('./config').port;

db.init();

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.send('Hello AppBee Mobile Server (' + process.env.NODE_ENV + ' v' +  packagejson.version +')');
});

app.use('/user', usersRouter);
app.use('/apps', appsRouter);
app.use('/stats', statsRouter);
app.use('/config', configurationRouter);
app.use('/recommend', recommendRouter);
app.use('/requests', requestsRouter);

app.use((err, req, res, next) => logError(err, req, res, next));
app.use((err, req, res, next) => handleError(err, req, res, next));

app.listen(port, () => {
    console.log('Express App on http port ' + port);
});

module.exports = app;