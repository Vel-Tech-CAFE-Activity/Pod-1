const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const session = require('express-session');
require('dotenv').config({ path: './.env' });

const AzureAuthentication = require('./component/AzureAuth')

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
}
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const authenticator = new AzureAuthentication();
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', authenticator.login({ scopes: ['openid', 'profile', 'user.read'] }));
app.get('/redirect', authenticator.getAccessToken());
app.get('/dashboard', (req, res, next) => {
  const accessToken = req.session.accessToken;
  const name = req.session.name;
  const email = req.session.email;
  res.render('dashboard', { accessToken , name, email });
});
app.get('/logout', authenticator.logout());


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

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

module.exports = app;
