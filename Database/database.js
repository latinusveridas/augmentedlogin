var mysql = require('mysql');

//DEFINE POOLING
var pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.OPENSHIFT_MYSQL_DB_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});


module.exports.pool = pool;




