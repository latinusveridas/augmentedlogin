var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('file-system');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var Users = require('./Routes2/Users');
var database = require('../Database/database');

app.use('/users', Users);

app.get('/showfields', function (res, req) {

    database.pool.getConnection(function (err, conn) {
        if (err) {
            appData.error = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            conn.query('SHOW COLUMNS FROM users', function (err, rows, fields) {
                if (!err) {
                    res.json(rows);
                } else {
                    res.send("Problem");
                }
            });
        }
    });

});


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


app.get('/currentevents', (req, res) => res.json(sample_events))


var mysqlHost = process.env.OPENSHIFT_MYSQL_DB_HOST;
var mysqlPort = process.env.OPENSHIFT_MYSQL_DB_PORT;
var mysqlUser = process.env.MYSQL_USER; //mysql username
var mysqlPass = process.env.MYSQL_PASSWORD; //mysql password
var mysqlDb = process.env.MYSQL_DATABASE; //mysql database name

var mysqlString = 'mysql://'   + mysqlUser + ':' + mysqlPass + '@' + mysqlHost + ':' + mysqlPort + '/' + mysqlDb;

var mysqlClient = mysql.createConnection(mysqlString);

console.log("STANDARD DEBUG:" + process.env.OPENSHIFT_MYSQL_DB_HOST + process.env.OPENSHIFT_MYSQL_DB_PORT + process.env.MYSQL_USER + process.env.MYSQL_PASSWORD + process.env.MYSQL_DATABASE);

/*

//TESTING MySQL Pooling
app.get('/pool', function (req, res) {
    console.log("ENTERING IN POOLING CALLBACK");

    // GET CONNECTION
    pool.getConnection(function (err, conn) {
        if (err) {
            res.send("ERROR OCCURED")
        }
        else {
            res.send("CONNECTION ESTABLISHED !!!")
            console.log("CONNECTION ESTABLISHED!!!")
            conn.release();
            console.log("CONNECTION RELEASED")
        }
    });
}); */




































mysqlClient.connect(function (err) {
    if (err) console.log('DEBUG ERROR: ' + err.message);
    console.log('DEBUG: CONNECTION TO DB LOOKS FINE !!!!!!!!')
});

app.get('/showdatabases', function (req, res) {
        mysqlClient.query('SHOW DATABASES', function (err, results) {
            if (err) throw err;
            console.log(results);
            console.log('END OF QUERY')
            res.json(results);
   
        });
        
});

app.get('/selectdb', function (req, res) {
    mysqlClient.query('USE sampledb', function (err, results) {
        if (err) throw err;
        console.log(results);
        console.log('END OF QUERY')
        res.json(results);
    });

});

app.get('/showtables', function (req, res) {
    mysqlClient.query('show tables', function (err, results) {
        if (err) throw err;
        console.log(results);
        console.log('END OF QUERY')
        res.json(results);
    });

});

app.get('/createtable', function (req, res) {
    var querystring = 'CREATE TABLE `users` ( `id` int(11) NOT NULL, `first_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL, `last_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL, `email` varchar(100) COLLATE utf8_unicode_ci NOT NULL, `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL, `created` datetime NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
    mysqlClient.query(querystring, function (err, results) {
        if (err) throw err;
        console.log(results);
        console.log('END OF QUERY')
        res.json(results);
        res.end('<html><body><h1>Table Created !</h1></body></html>');
    });

});

app.get('/deletetable', function (req, res) {
    mysqlClient.query('drop table users', function (err, results) {
        if (err) throw err;
        console.log(results);
        console.log('END OF QUERY')
        res.json(results);
    });

});

app.get('/getall',function(req,res){
    mysqlClient.query('SELECT * FROM events_table',function (err,results) {
        if (err) throw err;
        console.log(results);
        res.json(results)
    });

});


/////PART mkdir experimental

var mkdirSync = require('mkdirp');

app.get('/mkdir', function (req, res) {

    mkdirSync('/images');

});

function mkdirSync(dirPath) {
    try {
        fs.mkdirSync(dirPath)
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
}


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
