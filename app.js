var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport');
var config = require('./config');
var cors = require('cors');
const swaggerUi = require('swagger-ui-express');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/uploadRouter');
var processRouter = require('./routes/processRouter');
var employeeRouter = require('./routes/employeeRouter');
var fileRouter = require('./routes/fileRouter');
var verifyEmployeeRouter = require('./routes/verifyEmployeeRouter');
const apiDoc = require('./docs/apiDoc.json');

const mongoose = require('mongoose');

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then(
  db => {
    console.log('Connected mongodb server');
  },
  err => console.log(err)
);

var app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      'https://' + req.hostname + ':' + app.get('secPort') + req.url
    );
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-01234-85971'));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/employees', employeeRouter);
app.use('/employee/verify', verifyEmployeeRouter);
app.use('/processes', processRouter);
app.use('/files', fileRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDoc));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
