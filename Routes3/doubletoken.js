var express = require('express');
var users = express.Router();
var database = require('../Database/database');
var cors = require('cors');
var jwt = require('jsonwebtoken');

var token;

users.use(cors());

process.env.SECRET_KEY = 'test';

users.post('/register', function (req, res) {
    var today = new Date();
    var appData = {
        "error": 1,
        "data": ""
    };
    var userData = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "password": req.body.password,
        "created": today
    };

    database.pool.getConnection(function (err, conn) {
        if (err) {
            appData.error = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            conn.query('INSERT INTO users SET ?', userData, function (err, rows, fields) {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = "User registered successfully !!!";
                    res.status(201).json(appData);
                } else {
                    appData["data"] = "Error occured";
                    res.status(400).json(appData);
                    res.status(400).json(err);
                    console.log(err);
                }
            });
            conn.release();
        }
    });

});

users.post('/login', function (req, res) {

    var appData = {
        "error": "0",
        "JWT1": "",
        "JWT2": ""
    };

    var email = req.body.email;
    var password = req.body.password;

    database.pool.getConnection(function (err, conn) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            conn.query('SELECT * FROM sampledb.users WHERE email = ?', [email], function (err, rows, fields) {
                console.log("DEBUG EMAIL" + email);
                if (err) {
                    appData["error"] = 1;
                    appData["data"] = "Error occured";
                    res.status(400).json(appData);
                } else {
                    console.log("IN THE VALIDATED err, FIRST SUCCESS");
                    if (rows.length > 0) {
                        console.log("ROW SUP A ZERO");
                        if (rows[0].password == password) {

                            console.log("IN FULLY SUCCESS BRACES");

                            var token1 = jwt.sign({ "password": rows[0].password }, 'test', { expiresIn: '12h' });
                            var token2 = jwt.sign({ "password": rows[0].password }, 'test', { expiresIn: 1 });

                            console.log("JWT1 = " + token1);
                            console.log("JWT2 = " + token2);

                            appData.error = 0;
                            appData["JWT1"] = token1;
                            appData["JWT2"] = token2;

                            res.status(200).json(appData);

                        } else {
                            appData["error"] = 1;
                            appData["data"] = "PW does not match";
                            res.status(204).json(appData);
                        }
                    }
                    else {
                        appData["error"] = 1;
                        appData["data"] = "email does not exists";
                        res.status(204).json(appData);
                    }
                }
            });
            console.log("BEFORE RELEASE");
            conn.release();
            console.log("AFTER RELEASE")
        }
    });

});

users.use(function (req, res, next) {
    var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function (err) {
            if (err) {
                appData.error = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                next();
            }
        });
    } else {
        appData.error = 1;
        appData["data"] = "No token";
        res.status(403).json(appData);
    }
});

users.get('/getUsers', function (req, res) {

    var appData = {};

    database.pool.getConnection(function (err, conn) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            conn.query('SELECT * FROM users', function (err, rows, field) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            conn.release();
        }
    });

});

// ============================REFRESH THE JWT 1 THROUGH HE JWT 2 POSTED AND COMPARED TO THOSE STORED IN THE DATABASE============================================================
users.post('/refresh', function (req, res) {

    //==========DATABASE INFORMATION=============
    //      jwt2 field name is : jwt2

    // COLLECT THE JWT2
    var JWT2 = req.body.token2 || req.headers['token2'];

    // PREPARE THE RESULT
    var result = {
        "error": 0,
        "errorDescription" : "",
        "jwt1": ""
    };

    // GO IN THE DATABASE
    database.pool.getConnection(function (err, conn) {
        if (err) {
            res.status(500).json(err);
        } else {
            // LAUNCH THE QUERY
            conn.query('SELECT * FROM sampledb.users WHERE jwt2 = ?', [JWT2], function (err, rows, field) {
                if (err) {
                    // ERROR ON QUERY
                    res.status(400).json(err);
                } else {
                    // SUCCESS ON QUERY
                    if (rows[0].jwt2 == JWT2) {
                        //SUCCESS ON THE SEARCH OF THE TOKEN JWT2
                        var token1 = jwt.sign({ "password": rows[0].password }, 'test', { expiresIn: 1 });
                        result["jwt1"] = token1;
                        res.status(200).json(result);
                    } else {
                        // FAIL ON THE SEARCH OF JWT2
                        result["error"] =  1;
                        result["jwt1"] = "";
                        result["errorDescription"] = "No token JWT found in the DB";
                        res.status(204).json(result)

                    }

                }

            });

            conn.release();

        }


    });

});

module.exports = users;