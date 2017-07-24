const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db.js');
const User = require('./user.js');
const UserAppList = require('./userAppList.js');

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
  var user = new User({ name: userName, email: userName + '@test.test' });
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
      res.send("Error finding user")
    });
});

app.get('/users', (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.send("Error finding user")
    });
});

app.post('/appInfoList', (req, res) => {
  console.log('------------------------- appInfoList')
  UserAppList.insertMany(req.body, (err, result) => {
    if(!err) {
      res.send(true);
    }
  });
})
app.post('/dailyUsageStats', (req, res) => {
  console.log('------------------------- daliyUsageStats')
  console.log(req.body);
  res.send(true);
})
app.post('/detailUsageStats', (req, res) => {
  console.log('------------------------- detailUsageStats')
  console.log(req.body);
  res.send(true);
})
app.post('/dailyUsageStatsByEvent', (req, res) => {
  console.log('------------------------- dailyUsageStatsByEvent')
  console.log(req.body);
  res.send(true);
})


app.listen(8080, () => {
  console.log('Express App on port 8080!');
});
