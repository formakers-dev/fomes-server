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
const betaTestsRouter = require('./router/betaTests');
const eventLogsRouter = require('./router/eventLogs');
const postsRouter = require('./router/posts');
const pointsRouter = require('./router/points');
const {logError, handleError} = require('./middleware/errorHandler');
const db = require('./db');
const config = require('./config');
const port = config.port;
const cors = require('cors');

db.init();

const whitelistOfCors = config.frontendBaseUrl.split(",");

const corsOptions = {
    origin: function(origin, callback) {
        const isWhitelisted = whitelistOfCors.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials:true
};

app.use(cors(corsOptions));

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.send('Hello AppBee Mobile Server (' + process.env.NODE_ENV + ' v' +  packagejson.version +')');
});

app.get('/landing', (req, res) => {
    // res.send('<meta http-equiv="refresh" content="0;url=https://play.google.com/store/apps/details?id=com.formakers.fomes">');
    // res.send('<a style="width:100px" href="https://play.google.com/store/apps/details?id=com.formakers.fomes&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"><img alt="다운로드하기 Google Play" src="https://play.google.com/intl/en_us/badges/images/generic/ko_badge_web_generic.png"/></a>');
    require('fs').readFile('./views/landing.html', (err, data) => {
        res.end(data);
    })
});

app.use('/user', usersRouter);
app.use('/apps', appsRouter);
app.use('/stats', statsRouter);
app.use('/config', configurationRouter);
app.use('/recommend', recommendRouter);
app.use('/beta-tests', betaTestsRouter);
app.use('/event-logs', eventLogsRouter);
app.use('/posts', postsRouter);
app.use('/points', pointsRouter);

app.use((err, req, res, next) => logError(err, req, res, next));
app.use((err, req, res, next) => handleError(err, req, res, next));

app.listen(port, () => {
    console.log('Express App on http port ' + port);
});

module.exports = app;
