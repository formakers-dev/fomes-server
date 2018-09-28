const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const packagejson = require('./package.json');
const statsRouter = require('./router/stats');
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

app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.send('Hello AppBee Mobile Server (' + process.env.NODE_ENV + ' v' +  packagejson.version +')');
});

app.use('/user', userRouter);
app.use('/stats', statsRouter);
app.use('/projects', projectRouter);
app.use('/config', configurationRouter);

app.listen(port, () => {
    console.log('Express App on http port ' + port);
});

module.exports = app;