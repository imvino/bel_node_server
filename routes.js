var jwt = require('jsonwebtoken');
// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'bel',
    password: process.env.DB_PASS
});

// Encryption for password
const bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports = app => {
    //login route
    app.post('/login', (req, res) => {
        let exp = 60 * 60;
        let pass = req.body?.password ? req.body.password : 'null';
        try {
            console.log(req.body)
            connection.query(
                'SELECT * FROM `users` WHERE `username` = ?',
                [req.body.username],
                function (err, sqlResults, fields) {
                    if (err) console.log(err)
                    console.log(sqlResults.length )
                    if(sqlResults.length === 1) {
                        bcrypt.compare(pass, sqlResults[0]['password']).then(function (result) {
                                if (result && sqlResults.length === 1) {
                                    var token = jwt.sign({id: sqlResults[0]['id']}, process.env.ACCESS_TOKEN, {expiresIn: exp});
                                    res.json({token: token, expires: exp});
                                } else {
                                    res.send("Sorry! Not found")
                                }
                            }
                        );
                    }else{
                        res.send("Sorry! Invalid Request ")
                    }
                });

        } catch (e) {
            res.json(e)
        }
    })

    //change password
    app.post('/password', (req, res) => {
        try {
            let oldPass = req.body?.oldPassword ? req.body.oldPassword : 'null';
            let token = req.body?.token ? req.body.token : 'err';
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return res.json('Invalid Token');
                }
                if (decoded) {
                    connection.query(
                        'SELECT * FROM `users` WHERE `id` = ?',
                        [decoded.id],
                        function (err, sqlResults, fields) {
                            if (err) console.log(err)
                            bcrypt.compare(oldPass, sqlResults[0]['password']).then(function (result) {
                                    if (result && sqlResults.length === 1) {
                                        bcrypt.hash(req.body.newPassword, saltRounds, function (err, hash) {
                                            connection.query(
                                                'UPDATE `users` SET `password` = ? WHERE  `id` = ?', [hash, decoded.id],)
                                            res.json('updated');
                                        });
                                    } else {
                                        res.send("Sorry! Invalid Request ")
                                    }
                                }
                            );
                        });
                }
            });
        } catch (e) {
            res.json(e)
        }
    });

    //get all users
    app.get('/user', (req, res) => {
        try {
            let token = req.body?.token ? req.body.token : 'err';
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return res.json('Invalid Token');
                }
                if (decoded) {
                    connection.query(
                        'SELECT * FROM `users` WHERE 1',
                        function (err, sqlResults, fields) {
                            if (err) console.log(err)
                            if (sqlResults) {
                                res.json(sqlResults);
                            } else {
                                res.send("Sorry! Invalid Request ")
                            }
                        });
                }
            })
        } catch (e) {
            res.json(e)
        }
    });

    //get user by username
    app.get('/user/:username', (req, res) => {
        try {
            let token = req.body?.token ? req.body.token : 'err';
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return res.json('Invalid Token');
                }
                if (decoded) {
                    connection.query(
                        'SELECT * FROM `users` WHERE `username`=? ',
                        [req.params.username],
                        function (err, sqlResults, fields) {
                            if (err) console.log(err)
                            if (sqlResults) {
                                res.json(sqlResults);
                            } else {
                                res.send("Sorry! Invalid Request ")
                            }
                        });
                }
            })
        } catch (e) {
            res.json(e)
        }
    });

    //delete user
    app.delete('/user/:username', (req, res) => {
        try {
            let token = req.body?.token ? req.body.token : 'err';
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return res.json('Invalid Token');
                }
                if (decoded) {
                    let pass = req.body?.password ? req.body.password : 'null';
                    connection.query(
                        'SELECT * FROM `users` WHERE `username` = ?',
                        [req.body.username],
                        function (err, sqlResults, fields) {
                            if (err) console.log(err)
                            bcrypt.compare(pass, sqlResults[0]['password']).then(function (result) {
                                if (result && sqlResults.length === 1) {
                                    connection.query(
                                        'DELETE FROM `users` WHERE `username`=? and `fullname`=?',
                                        [req.body.username, req.body.name],
                                        function (err, sqlResults, fields) {
                                            if (err) console.log(err)
                                            if (sqlResults) {
                                                res.json('user deleted');
                                            } else {
                                                res.status(200).send("Sorry! Invalid Request ")
                                            }
                                        });
                                } else {
                                    res.send("Sorry! Invalid Request ")
                                }
                            })
                        });
                }
            })
        } catch (e) {
            res.json(e)
        }
    });

    //get all post
    app.get('/post', (req, res) => {
        try {
            connection.query(
                'SELECT * FROM `posts` WHERE 1',
                function (err, sqlResults, fields) {
                    if (err) console.log(err)
                    if (sqlResults) {
                        res.json(sqlResults);
                    } else {
                        res.status(200).send("Sorry! Invalid Request ")
                    }
                });

        } catch (e) {
            res.json(e)
        }
    });

    //get post by id
    app.get('/post/:id', (req, res) => {
        try {
            connection.query(
                'SELECT * FROM `posts` WHERE `id`=?',
                [req.params.id],
                function (err, sqlResults, fields) {
                    if (err) console.log(err)
                    if (sqlResults) {
                        res.json(sqlResults);
                    } else {
                        res.status(200).send("Sorry! Invalid Request ")
                    }
                });

        } catch (e) {
            res.json(e)
        }
    });

    //insert new post
    app.post('/post', (req, res) => {
        try {
            let token = req.body?.token ? req.body.token : 'err';
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return res.json('Invalid Token');
                }
                if (decoded) {
                    connection.query(
                        'INSERT INTO `posts`( `title`, `content`) VALUES (?,?)',
                        [req.body.title, req.body.content],
                        function (err, sqlResults, fields) {
                            if (err) console.log(err)
                            if (sqlResults) {
                                res.json({id: sqlResults.insertId});
                            } else {
                                res.status(200).send("Sorry! Invalid Request ")
                            }
                        });
                }
            });
        } catch (e) {
            res.json(e)
        }
    });

}
