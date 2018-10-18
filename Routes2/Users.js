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
    
    var email = req.body.email;
    var password = req.body.password;

    var userData = {
        "email": email,
        "password": password
    };

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
                            console.log("DEBUG ROW O: " + rows[0]);
                            console.log("DEBUG ROW 0 avec password: " + rows[0].password);
                            console.log("DEBUT userDATA password : " + userData["password"]);

                            let token = jwt.sign(userData["password"], process.env.SECRET_KEY, { expiresIn: '12h' }, function (err, token) {
                                if (err) {
                                    res.json(err);
                                    console.log("THINGS ARE REALLY SAD");
                                    console.log(err);
                                } else {
                                    console.log("WE ARE IN THE ELSE SUCESSFULLY BRACCES OLALA");
                                    res.json(token);
                                }
                            }
                            );
                            console.log("AFTER TOKEN CREATION");
                            appData.error = 0;
                            appData["token"] = token;
                            //res.status(200).json(appData);
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
            conn.release();
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

module.exports = users;