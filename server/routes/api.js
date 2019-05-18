const express = require('express');
const router = express.Router();
var sha1 = require('sha1');
const axios = require('axios');
const API = 'https://jsonplaceholder.typicode.com';
const mysql = require('mysql');


var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'management'
});
/*
var connection = mysql.createPool({
    host: 'server9.contrateam.com:2083',
    user: 'zoranjer_koja',
    password: 'vrbovac12345',
    database: 'zoranjer_alek_kojic'
})
*/
/*
var connection = mysql.createPool({
    host: 'sql9.freemysqlhosting.net',
    user: 'sql9231131',
    password: 'p9WBlft2KD',
    database: 'sql9231131'
})*/

console.log(connection);

/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

router.get('/posts', (req, res) => {
    // Get posts from the mock api
    // This should ideally be replaced with a service that connects to MongoDB
    axios.get(`${API}/posts`)
        .then(posts => {
            res.status(200).json(posts.data);
        })
        .catch(error => {
            res.status(500).send(error)
        });
});

router.post('/signUp', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        console.log(conn);
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var user = req.body.username;
        var shortname = req.body.shortname;
        var pass = sha1(req.body.password);

        test = {};
        var podaci = {
            'id': '',
            'shortname': shortname,
            'password': pass,
            'street': '',
            'zipcode': '',
            'place': '',
            'email': email,
            'telephone': '',
            'mobile': '',
            'birthday': '',
            'incompanysince': '',
            'type': 0,
            'companyId': '',
            'active': 0
        };
        console.log(podaci);

        conn.query("SELECT * FROM users WHERE email=?", [req.body.email],
            function(err, rows, fields) {
                if (err) {
                    console.error("SQL error:", err);
                    res.json({ "code": 100, "status": "Error in connection database" });
                    return next(err);
                }
                console.log(rows);
                if (rows.length >= 1) {
                    test.success = false;
                    test.info = 'Email already exists!';
                    res.json(test);
                } else {
                    conn.query("insert into users SET ?", podaci, function(err, rows) {
                        conn.release();
                        if (!err) {
                            if (!err) {
                                test.id = rows.insertId;
                                test.success = true;
                            } else {
                                test.success = false;
                                test.info = 'Error';
                            }
                            res.json(test);
                        } else {
                            res.json({ "code": 100, "status": "Error in connection database" });
                            console.log(err);
                        }
                    });
                }
            }
        );
        conn.on('error', function(err) {
            console.log("[mysql error]", err);
        });
    });
});

router.post('/createTask', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        console.log(conn);
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        console.log(req);
        var podaci = {
            'creator_id': req.body.creator_id,
            'customer_id': req.body.user.id,
            'title': req.body.title,
            'start': req.body.start,
            'end': req.body.end
        };
        console.log(podaci);


        conn.query("insert into tasks SET ?", podaci, function(err, rows) {
            conn.release();
            if (!err) {
                if (!err) {
                    test.id = rows.insertId;
                    test.success = true;
                } else {
                    test.success = false;
                }
                res.json(test);
                console.log("Usao sam u DB!!!!");
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
                console.log(err);
            }
        });
        conn.on('error', function(err) {
            console.log("[mysql error]", err);
        });
    });
});

router.get('/getTasks', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        conn.query("SELECT * from tasks", function(err, rows) {
            conn.release();
            if (!err) {

                res.json(rows);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
            }
        });


        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/getTasksForUser/:id', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var id = req.params.id;
        conn.query("SELECT * from tasks where creator_id = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {

                res.json(rows);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
            }
        });


        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.post('/login', (req, res, next) => {
    try {
        var reqObj = req.body;
        connection.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                res.json({ "code": 100, "status": "Error in connection database" });
                return next(err);
            } else {
                console.log(reqObj.username, sha1(reqObj.password));
                conn.query("SELECT * FROM users WHERE email=? AND password=?", [reqObj.email, sha1(reqObj.password)],
                    function(err, rows, fields) {
                        if (err) {
                            console.error("SQL error:", err);
                            res.json({ "code": 100, "status": "Error in connection database" });
                            return next(err);
                        }
                        if (rows.length >= 1 && rows[0].active === 1) {
                            conn.release();
                            //req.session.user = rows[0];
                            //req.session.auth = true;

                            res.send({ login: true, notVerified: rows[0].active, user: rows[0].shortname, type: rows[0].type, id: rows[0].id, companyId: rows[0].companyId });
                        } /*else {
                            console.log('usao sam u else!');
                            conn.query("SELECT * FROM companies WHERE email=? AND password=?", [reqObj.email, sha1(reqObj.password)],
                                function(err, rows, fields) {
                                    conn.release();
                                    if (err) {
                                        console.error("SQL error:", err);
                                        res.json({ "code": 100, "status": "Error in connection database" });
                                        return next(err);
                                    }
                                    console.log(rows);
                                    if (rows.length >= 1 && rows[0].active === 1) {
                                        console.log('usao sam ovdee u if');
                                        //req.session.user = rows[0];
                                        //req.session.auth = true;

                                        res.send({ login: true, notVerified: rows[0].active, user: rows[0].shortname, type: 0, id: rows[0].id, companyId: rows[0].companyId });
                                    } else {
                                        console.log('usao sam ovdee u else');
                                        res.send({ login: false });
                                    }
                                }
                            );
                        }*/
                    }
                );
            }
        });
    } catch (ex) {
        console.error("Internal error: " + ex);
        return next(ex);
    }
});



router.post('/createUser', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        console.log(conn);
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var user = req.body.username;
        var shortname = req.body.shortname;
        var pass = sha1(req.body.password);

        test = {};
        var podaci = {
            'id': '',
            'shortname': req.body.shortname,
            'password': sha1(req.body.password),
            'firstname': req.body.firstname,
            'lastname': req.body.lastname,
            'shortname': req.body.shortname,
            'street': req.body.street,
            'zipcode': req.body.zipcode,
            'place': req.body.place,
            'email': req.body.email,
            'telephone': req.body.telephone,
            'mobile': req.body.mobile,
            'birthday': req.body.birthday,
            'incompanysince': req.body.incompanysince,
            'type': req.body.type,
            'companyId': req.body.companyId,
            'active': 1
        };
        console.log(podaci);

        conn.query("SELECT * FROM users WHERE email=?", [req.body.email],
            function(err, rows, fields) {
                if (err) {
                    console.error("SQL error:", err);
                    res.json({ "code": 100, "status": "Error in connection database" });
                    return next(err);
                }
                console.log(rows);
                if (rows.length >= 1) {
                    test.success = false;
                    test.info = 'Email already exists!';
                    res.json(test);
                } else {
                    conn.query("insert into users SET ?", podaci, function(err, rows) {
                        conn.release();
                        if (!err) {
                            if (!err) {
                                test.id = rows.insertId;
                                test.success = true;
                            } else {
                                test.success = false;
                                test.info = 'Error';
                            }
                            res.json(test);
                        } else {
                            res.json({ "code": 100, "status": "Error in connection database" });
                            console.log(err);
                        }
                    });
                }
            }
        );
        conn.on('error', function(err) {
            console.log("[mysql error]", err);
        });
    });
});


router.get('/getUsers/:id', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id;
        conn.query("SELECT * from users u join store s on u.companyId = s.id where s.superadmin = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {

                res.json(rows);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
            }
        });


        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/getUsersInCompany/:id', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id;
        conn.query("SELECT * from users where companyId = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {

                res.json(rows);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
            }
        });


        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/getMe/:id', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id;
        conn.query("SELECT * from users where id = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {

                res.json(rows);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
            }
        });


        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});


router.post('/createStore', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        console.log(conn);
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var podaci = {
            'id': '',
            'storename': req.body.storename,
            'street': req.body.street,
            'zipcode': req.body.zipcode,
            'place': req.body.place,
            'email': req.body.email,
            'telephone': req.body.telephone,
            'mobile': req.body.mobile,
            'comment': req.body.comment,
            'superadmin': req.body.superadmin
        };
        

        conn.query("SELECT * FROM store WHERE email=?", [req.body.email],
            function(err, rows, fields) {
                if (err) {
                    console.error("SQL error:", err);
                    res.json({ "code": 100, "status": "Error in connection database" });
                    return next(err);
                }
                console.log(rows);
                if (rows.length >= 1) {
                    test.success = false;
                    test.info = 'Email already exists!';
                    res.json(test);
                } else {
                    conn.query("insert into store SET ?", podaci, function(err, rows) {
                        conn.release();
                        if (!err) {
                            if (!err) {
                                test.id = rows.insertId;
                                test.success = true;
                            } else {
                                test.success = false;
                                test.info = 'Error';
                            }
                            res.json(test);
                        } else {
                            res.json({ "code": 100, "status": "Error in connection database" });
                            console.log(err);
                        }
                    });
                }
            }
        );
        conn.on('error', function(err) {
            console.log("[mysql error]", err);
        });
    });
});

router.get('/getStore/:id', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id;
        conn.query("SELECT * from store where superadmin = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {

                res.json(rows);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
            }
        });


        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.post('/createCustomer', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        console.log(conn);
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var podaci = {
            'id': '',
            'shortname': req.body.shortname,
            'firstname': req.body.firstname,
            'lastname': req.body.lastname,
            'gender': req.body.gender,
            'street': req.body.street,
            'streetnumber': req.body.streetnumber,
            'city': req.body.city,
            'telephone': req.body.telephone,
            'mobile': req.body.mobile,
            'email': req.body.email,
            'birthday': req.body.birthday,
            'companyId': req.body.companyId
        };
        console.log(podaci);

        conn.query("SELECT * FROM customers WHERE shortname=?", [req.body.shortname],
            function(err, rows, fields) {
                if (err) {
                    console.error("SQL error:", err);
                    res.json({ "code": 100, "status": "Error in connection database" });
                    return next(err);
                }
                console.log(rows);
                if (rows.length >= 1) {
                    test.success = false;
                    test.info = 'Email already exists!';
                    res.json(test);
                } else {
                    conn.query("insert into customers SET ?", podaci, function(err, rows) {
                        conn.release();
                        if (!err) {
                            if (!err) {
                                test.id = rows.insertId;
                                test.success = true;
                            } else {
                                test.success = false;
                                test.info = 'Error';
                            }
                            res.json(test);
                        } else {
                            res.json({ "code": 100, "status": "Error in connection database" });
                            console.log(err);
                        }
                    });
                }
            }
        );
        conn.on('error', function(err) {
            console.log("[mysql error]", err);
        });
    });
});

router.get('/getCustomers/:id', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id;
        conn.query("SELECT * from customers where companyId = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {

                res.json(rows);
            } else {
                res.json(null);
            }
        });


        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/activeUser/:id', function(req, res, next) {
    console.log("pozvano za edit!!!");
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var id = req.params.id;

        conn.query("UPDATE users SET active = 1 where id = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {
                if (!err) {
                    test.success = true;
                } else {
                    test.success = false;
                }
                res.json(test);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
                console.log(err);
            }
        });
        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.get('/deactiveUser/:id', function(req, res, next) {
    console.log("pozvano za edit!!!");
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var id = req.params.id;

        conn.query("UPDATE users SET active = 0 where id = ?", [id], function(err, rows) {
            conn.release();
            if (!err) {
                if (!err) {
                    test.success = true;
                } else {
                    test.success = false;
                }
                res.json(test);
                console.log("Usao sam u DB!!!!");
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
                console.log(err);
            }
        });
        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.post('/addUser', function(req, res, next) {
    console.log("pozvano!");
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var nameOfClinic = req.body.nameOfClinic;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var phoneNumber = req.body.phoneNumber;
        var email = req.body.email;
        var user = req.body.username;
        var pass = sha1(req.body.password);
        var confirmPassword = sha1(req.body.confirmPassword);
        var active;
        if (req.body.active) {
            active = 1;
        } else {
            active = 0;
        }
        test = {};
        var podaci = {
            'nameOfClinic': nameOfClinic,
            "firstname": firstname,
            "lastname": lastname,
            "phoneNumber": phoneNumber,
            "email": email,
            "username": user,
            "password": pass,
            "confirmPassword": confirmPassword,
            "active": active,
            "typeOfUser": "2",
        };

        console.log(podaci);


        conn.query("insert into users SET ?", podaci, function(err, rows) {
            conn.release();
            if (!err) {
                if (!err) {
                    test.id = rows.insertId;
                    test.success = true;
                } else {
                    test.success = false;
                }
                res.json(test);
                console.log("Usao sam u DB!!!!");
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
                console.log(err);
            }
        });
        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.post('/editUser', function(req, res, next) {
    console.log("pozvano!");
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var id = req.body.id;
        var nameOfClinic = req.body.nameOfClinic;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var phoneNumber = req.body.phoneNumber;
        var email = req.body.email;
        var user = req.body.username;
        var pass = sha1(req.body.password);
        var confirmPassword = sha1(req.body.confirmPassword);
        var active;
        if (req.body.active) {
            active = 1;
        } else {
            active = 0;
        }
        test = {};
        var podaci = {
            'nameOfClinic': nameOfClinic,
            "firstname": firstname,
            "lastname": lastname,
            "phoneNumber": phoneNumber,
            "email": email,
            "username": user,
            "password": pass,
            "confirmPassword": confirmPassword,
            "active": active,
            "typeOfUser": "2",
        };

        console.log(podaci);


        conn.query("update users SET ? where id = '" + id + "'", podaci, function(err, rows) {
            conn.release();
            if (!err) {
                if (!err) {
                    test.id = rows.insertId;
                    test.success = true;
                } else {
                    test.success = false;
                }
                res.json(test);
                console.log("Usao sam u DB!!!!");
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
                console.log(err);
            }
        });
        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.get('/deleteUser/:id', (req, res, next) => {
    try {
        var reqObj = req.params.id;

        console.log('usao sam u verifikaciju!');
        console.log(reqObj);
        connection.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                res.json({ "code": 100, "status": "Error in connection database" });
                return next(err);
            } else {
                conn.query("delete from users where id = '" + reqObj + "'",
                    function(err, rows, fields) {
                        conn.release();
                        if (err) {
                            console.error("SQL error:", err);
                            res.json({ "code": 100, "status": "Error in connection database" });
                            return next(err);
                        } else {
                            res.writeHead(302, { 'Location': '/login' });
                            res.end();
                        }
                    }
                );
            }
        });
    } catch (ex) {
        console.error("Internal error: " + ex);
        return next(ex);
    }

});

router.get('/korisnik/verifikacija/:id', (req, res, next) => {
    try {
        var reqObj = req.params.id;

        console.log('usao sam u verifikaciju!');
        console.log(reqObj);
        connection.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                res.json({ "code": 100, "status": "Error in connection database" });
                return next(err);
            } else {
                conn.query("UPDATE users SET active='1' WHERE SHA1(email)='" + reqObj + "'",
                    function(err, rows, fields) {
                        conn.release();
                        if (err) {
                            console.error("SQL error:", err);
                            res.json({ "code": 100, "status": "Error in connection database" });
                            return next(err);
                        } else {
                            res.writeHead(302, { 'Location': '/login' });
                            res.end();
                        }
                    }
                );
            }
        });
    } catch (ex) {
        console.error("Internal error: " + ex);
        return next(ex);
    }

});

router.get('/sendChangePassword/:id', (req, res, next) => {
    try {
        var reqObj = req.params.id;
        console.log(reqObj);
        connection.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                res.json({ "code": 100, "status": "Error in connection database" });
                return next(err);
            } else {
                conn.query("UPDATE users SET password='" + reqObj + "' WHERE SHA1(email)='" + reqObj + "'",
                    function(err, rows, fields) {
                        conn.release();
                        if (err) {
                            console.error("SQL error:", err);
                            res.json({ "code": 100, "status": "Error in connection database" });
                            return next(err);
                        } else {
                            res.writeHead(302, { 'Location': '/changePassword' });
                            res.end();
                        }
                    }
                );
            }
        });
    } catch (ex) {
        console.error("Internal error: " + ex);
        return next(ex);
    }

});

router.post('/postojikorisnik', (req, res, next) => {
    try {
        var reqObj = req.body;
        console.log(reqObj);
        console.log('postoji korisnik...');
        connection.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                res.json({ "code": 100, "status": "Error in connection database" });
                return next(err);
            } else {
                conn.query("SELECT * FROM users u WHERE u.email=?", [reqObj.email],
                    function(err, rows, fields) {
                        conn.release();
                        if (err) {
                            console.error("SQL error:", err);
                            res.json({ "code": 100, "status": "Error in connection database" });
                            return next(err);
                        }

                        if (rows.length >= 1 && rows[0].active == '1') {
                            res.send({ exist: true, notVerified: false });
                        } else if (rows.length >= 1) {
                            res.send({ exist: true, notVerified: true });
                        } else {
                            res.send({ exist: false, notVerified: true });
                        }
                    }
                );
            }
        });
    } catch (ex) {
        console.error("Internal error: " + ex);
        return next(ex);
    }
});


// Promena zaboravljene lozinke
router.post('/korisnik/forgotpasschange', (req, res, next) => {
    try {
        var reqObj = req.body;
        console.log('pozvao sam funkciju!!!');
        console.log(reqObj);
        var email = reqObj.email;
        var newPassword1 = reqObj.password;
        var newPassword2 = reqObj.password2;

        connection.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                res.json({ "code": 100, "status": "Error in connection database" });
                return next(err);
            } else {
                if (newPassword1 == newPassword2) {
                    conn.query("UPDATE users SET password='" + sha1(newPassword1) + "' WHERE  sha1(email)='" + email + "'",
                        function(err, rows, fields) {
                            conn.release();
                            if (err) {
                                console.error("SQL error:", err);
                                res.json({ "code": 100, "status": "Error in connection database" });
                                return next(err);
                            } else {
                                res.send({ "code": "true", "message": "The password is success change!" });
                            }
                        });
                }
            }
        });
    } catch (ex) {
        console.error("Internal error: " + ex);
        return next(ex);
    }

});

router.get('/getUserWithID/:userid', function(req, res, next) {
    connection.getConnection(function(err, conn) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        conn.query("select * from users where id = ?", [req.params.userid], function(err, rows) {
            conn.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log(rows[i]);
                }

                console.log("Ovdee :D");
                res.json(test);
            } else {
                res.json({ "code": 100, "status": "Error in connection database" });
            }
        });

        conn.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

module.exports = router;