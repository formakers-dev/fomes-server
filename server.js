const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const statsRouter = require('./router/stats');
const appsRouter = require('./router/apps');
const userRouter = require('./router/user');
const Auth = require('./middleware/auth');
const db = require('./db');
const port = process.env.PORT || 8080;

db();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.send('hello world')
});

app.use('/user', userRouter);
app.use('/stats', Auth.appBeeTokenVerifier, statsRouter);
app.use('/apps', Auth.appBeeTokenVerifier, appsRouter);

app.listen(port, () => {
    console.log('Express App on port ' + port);
});

module.exports = app;