const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017//admin`;

module.exports = () => {
  const connect = () => {
    mongoose.connect(MONGO_URL, {
      dbName: 'gifchat',
    }, (error) => {
      if (error) {
        console.log('mongoDB connection ERROR', error);
      } else {
        console.log('mongoDB commection SUCCESS');
      }
    });
  };
  connect();

  mongoose.connection.on('error', (error) => {
    console.error('mongoDB connection ERROR', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('mongoDB disconnected. Retry the connection.');
    connect();
  });

  require('./chat'); // schema 불러옴.
  require('./room');
};
