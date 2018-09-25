
var logger = require("../util/logger");

const mongoose = require('mongoose');

require('./User');
require('./Image');
require('./Word');
require('./Report');
require('./Block');
require('./Favorite');
require('./PhoneChecker');


if (process.env.NODE_ENV !== 'production') {
  // console.log('mogoose in debug mode');
  mongoose.set('debug', true);
}

// const connectMongoDb = () => {
//   mongoose.connect(process.env.REMOTE_DB_URI);
//   // if (process.env.NODE_ENV !== 'production') {
//   mongoose.connection
//     .on('open', () => {
//       // console.log(`Connected to db OK`);
//       logger.info(`Connected to db OK`);
//     })
//     .on('error', err => {
//       // console.log('Error connecting to db:', err)
//       logger.error('Error connecting to db:', err);
//     });
//   // }
// }

// @2018-06-20 17:15:12
const connectMongoDb = () => {
  mongoose.connect(process.env.REMOTE_DB_URI, {
    auth: {
      user: process.env.REMOTE_DB_USER,
      password: process.env.REMOTE_DB_PASS,
    },
    useNewUrlParser: true,
  }).then(
    () => {
      logger.info(`Connected to db OK : ${mongoose.connection.host}`);
    },
    err => {
      logger.error(`Error connecting to db: ${err}`);
    }
  );
}

module.exports = { connectMongoDb };
