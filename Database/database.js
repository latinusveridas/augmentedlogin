var mysql = require('mysql');

//DEFINE POOLING
var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "Miroslava326356$$$$$",
    database: "sampledb"
});


module.exports.pool = pool;




