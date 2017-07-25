const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db');
const User = require('./models/user');
const UserApps = require('./routes/userApps');
const ShortTermStats = require('./routes/shortTermStats');
const LongTermStats = require('./routes/longTermStats');

db();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.send('hello world')
});

app.post('/user/:name', (req, res) => {
  const userName = req.params.name;
  let user = new User({ name: userName, email: userName + '@test.test' });
  user.save((err) => {
    if (err) {
      res.send(err);
    } else {
      res.send(userName + 'is successfully added');
    }
  });
});

app.get('/user/:name', (req, res) => {
  User.find({ name: req.params.name })
    .exec()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.send("Error finding user :" + err)
    });
});

app.get('/users', (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.send("Error finding user : " + err)
    });
});


app.route('/user/:email/apps')
    .get(UserApps.getUserApps)
    .post(UserApps.postUserApps);

app.route('/user/:email/shortTermStats')
    .get(ShortTermStats.getShortTermStats)
    .post(ShortTermStats.postShortTermStats);

app.route('/user/:email/longTermStats')
    .get(LongTermStats.getLongTermStats)
    .post(LongTermStats.postLongTermStats);

app.post('/dailyUsageStats', (req, res) => {
  console.log('------------------------- daliyUsageStats');
  console.log(req.body);
  res.send(true);
});

app.post('/detailUsageStats', (req, res) => {
  console.log('------------------------- detailUsageStats');
  console.log(req.body);
  res.send(true);
});

app.post('/dailyUsageStatsByEvent', (req, res) => {
  console.log('------------------------- dailyUsageStatsByEvent');
  console.log(req.body);
  res.send(true);
});

app.listen(8080, () => {
    console.log('Express App on port 8080!');
});

module.exports = app;


