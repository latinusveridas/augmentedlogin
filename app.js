var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mysql = require('mysql'); 

var app = express();

///////////////

let sample_events = [
  {
      id: "E_d8w56df5w65fd4d65f4er5das65qwe45sa5re",
      organizer: "Elon Musk",
      sport: "Musculation",
      ppp: 4,
      maxp: 10,
      location: "Los Angeles",
      image: "musculation"
  },
  {
      id: "E_8w6g5z8v56s98r1g5s5er47h1s5rt4gd4ef4d45er",
      organizer: "Steve Jobs",
      sport: "Yoga",
      ppp: 10,
      maxp: 50,
      location: "Palo Alto",
      image: "yoga"
  },
  {
      id: "E_p89we45e5as8w5d4fe5f45d4fef8fr564wert54err",
      organizer: "Larry Elisson",
      sport: "Volley",
      ppp: 50,
      maxp: 4,
      location: "Le Havre",
      image: "volley"
  },

]

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.get('/currentevents', (req, res) => res.json(sample_events))


var mysqlHost = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
var mysqlPort = process.env.OPENSHIFT_MYSQL_DB_PORT || 3306;
var mysqlUser = 'rootaccess'; //mysql username
var mysqlPass = 'Miroslava326356$$$$$'; //mysql password
var mysqlDb   = 'sampledb'; //mysql database name

var mysqlString = 'mysql://'   + mysqlUser + ':' + mysqlPass + '@' + mysqlHost + ':' + mysqlPort + '/' + mysqlDb;

console.log('**********************************DEBUG*************************************')
console.log(mysqlHost)
console.log(mysqlPort)

var mysqlClient = mysql.createConnection(mysqlString);
mysqlClient.connect(function (err) {
    console.log('DEBUG: CONNECTION TO DB LOOKS FINE !!!!!!!!')
  if (err) console.log(err);
});

// app is running!
app.get('/dbstatus', function(req, res) {
  res.send('OK');
});




/*
var mysql = require('mysql');

var con = mysql.createConnection({ 
    host  : process.env.OPENSHIFT_MYSQL_DB_HOST, 
    user  : process.env.OPENSHIFT_MYSQL_DB_USERNAME, 
    password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD, 
    port  : process.env.OPENSHIFT_MYSQL_DB_PORT, 
    database : process.env.OPENSHIFT_APP_NAME 
}); 


con.connect(function(err) {
  if (err) throw err;
  app.get('/dbtest', (req, res) => res.json({status: "success"}))
});

*/

///////////




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
