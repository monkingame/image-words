
const path = require('path');

const winston = require('winston');
const { createLogger, format, transports, } = require('winston');
const { combine, timestamp, label, printf, colorize, } = format;

//如果不存在的话，需要先创建logs目录，否则log文件不会被自动创建
// console.log(process.env.NODE_ENV);

// function getLoggerTimestamp() {
//   const d = new Date();
//   return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}.${d.getMilliseconds()}`;
// }

const formatTimestamp = 'YYYY-MM-DD HH:mm:ss.SSS';
const myFormat = printf(info => {
  // return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
  // console.log(info);
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

// // 2.x版本
// const customTransports = [
//   new transports.File({
//     level: 'info',
//     filename: path.join(__dirname, '/../logs', 'apiserver.log'),
//     handleExceptions: true,
//     json: false,
//     maxsize: 10 * 1024 * 1024,
//     maxFiles: 5,
//     colorize: false,
//     'timestamp': getLoggerTimestamp,
//   })
// ];

// 3.x版本
const customTransports = [
  new transports.File({
    level: 'info',
    filename: path.join(__dirname, '/../logs', 'apiserver.log'),
    handleExceptions: true,
    // json: false,
    format: combine(
      label({ label: 'file' }),
      timestamp({ format: formatTimestamp, }),
      myFormat
    ),
    maxsize: 10 * 1024 * 1024,
    // colorize: false,
  })
];


// if (process.env.NODE_ENV !== 'production') {
//   transports.push(new winston.transports.Console({
//     level: 'debug',
//     handleExceptions: true,
//     json: false,
//     colorize: true,
//     // 'timestamp': getLoggerTimestamp,
//   }));
// }

if (process.env.NODE_ENV !== 'production') {
  customTransports.push(new transports.Console({
    level: 'debug',
    // handleExceptions是用来捕获出现的exception，否则有exception也不打印
    handleExceptions: true,
    // format: winston.format.simple(),
    format: combine(
      label({ label: 'console' }),
      timestamp({ format: formatTimestamp, }),
      colorize(),
      myFormat,
    ),
    colorize: true,
    // 'timestamp': getLoggerTimestamp,
  }));
}

// @2018-08-02 11:19:49 升级到winston3.0
const logger = winston.createLogger({
  transports: customTransports,
  exitOnError: false
});


module.exports = logger;
module.exports.stream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};
