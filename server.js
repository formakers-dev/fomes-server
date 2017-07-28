const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db');
const User = require('./routes/user');
const UserApps = require('./routes/userApps');
const ShortTermStats = require('./routes/shortTermStats');
const LongTermStats = require('./routes/longTermStats');
const EventStats = require('./routes/eventStats');
const port = process.env.PORT || 8080;

db();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.send('hello world')
});

app.route('/auth/google/callback')
    .get(test)
    .post(test);

app.route('/user')
    .post(User.postUser);

app.route('/apps/:userId')
    .get(UserApps.getUserApps)
    .post(UserApps.postUserApps);

app.route('/stats/short/:userId')
    .post(ShortTermStats.postShortTermStats);

app.route('/stats/event/:userId')
    .post(EventStats.postEventStats);

app.route('/stats/long/:userId')
    .post(LongTermStats.postLongTermStats);

app.listen(port, () => {
    console.log('Express App on port ' + port);
});

function test() {
    console.log("TEST CALLED");
}

module.exports = app;

