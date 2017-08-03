const mongoose = require('mongoose');
const config = require('./config')[process.env.NODE_ENV];

module.exports = () => {
  function connect() {
    const dbUrl = config.dbUrl;
    mongoose.connect(dbUrl, function(err) {
      if (err) {
        console.error('mongodb connection error', err);
      }
      console.log('mongodb connected');
    });
  }

  connect();
  mongoose.connection.on('disconnected', connect);
};
