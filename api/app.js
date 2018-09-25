"use strict"

//app.js: api server
require('dotenv').config();

var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

//session & db
// @2018-06-20 17:16:56
const session = require('express-session');

var app = express();

app.use(cors());

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//NOTE:log
// var logStream = fs.createWriteStream(path.join(__dirname, 'apiserver.log'), { flags: 'a' });
// app.use(logger('dev'));
// app.use(logger('common'));
//Log to file
// app.use(morgan('combined', { stream: logStream }));
var dirLogs = path.join(__dirname, 'logs');
if (!fs.existsSync(dirLogs)) {
  fs.mkdirSync(dirLogs);
}
var logger = require("./util/logger");
// TODO: NOTE: 暂且关闭log，貌似打印出的信息无用
// app.use(morgan('short', { stream: logger.stream }));


// app.use(bodyParser.json());
//limit tp 50M
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//db-->

const db = require('./db');
db.connectMongoDb();

//<--db



//-> Apollo
const END_POINT_APOLLO = '/api';
// // Apollo Graphql
// const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

// const schema = require('./graphql');
// const productionMode = (process.env.NODE_ENV === 'production');
// // @2018-06-19 18:15:23
// app.use('/api', bodyParser.json(),
//   graphqlExpress({
//     schema,
//   })
// );

// if (!productionMode) {
//   app.use('/igql', graphiqlExpress({ endpointURL: '/api' }));
// }

// @2018-08-02 13:35:05 upgrade to v2.0
const productionMode = (process.env.NODE_ENV === 'production');

const { ApolloServer } = require('apollo-server-express');
const schema = require('./graphql');
const server = new ApolloServer({
  schema,
  introspection: !productionMode,
  playground: !productionMode,
});
server.applyMiddleware({
  app,
  path: END_POINT_APOLLO,
  bodyParserConfig: bodyParser.json(),
});
app.use(END_POINT_APOLLO, () => { });

//<- Apollo

// //default route
// app.get('*', function (req, res) {
//   res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
// })

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

  //TODO:打印堆栈
  logger.error(`api server app error : ${err}`);
});

module.exports = app;
// require('./routes/words.js')(app);

logger.info(`API server started@ ${process.env.PORT}`);

