
const mongoose = require('mongoose');

module.exports = () => {
  function connect() {
    const dbUrl = process.env['MONGO_URL'] || '';
    mongoose.Promise = global.Promise;
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
