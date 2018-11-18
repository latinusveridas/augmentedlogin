var mysql = require('mysql');

//DEFINE POOLING
var pool = mysql.createPool({
    connectionLimit: 10,
    host: "83.217.132.102",
    user: "root",
    password: "Miroslava326356$$$$$",
    database: "sampledb"
});


module.exports.pool = pool;




