const express = require('express');
const router = express.Router();
var sha1 = require('sha1');
const axios = require('axios');
const API = 'https://jsonplaceholder.typicode.com';
const mysql = require('mysql');
var fs = require("fs");
const path = require('path');

var connection = mysql.createPool({
  host: '185.178.193.141',
  user: 'appproduction.',
  password: 'jBa9$6v7',
  database: 'management'
})

/*var connection = mysql.createPool({
    host: '144.76.112.98',
    user: 'aparatiz_koja',
    password: 'Iva03042019',
    database: 'aparatiz_management'
})*/

/*
var connection = mysql.createPool({
    host: 'sql9.freemysqlhosting.net',
    user: 'sql9231131',
    password: 'p9WBlft2KD',
    database: 'sql9231131'
})*/

connection.getConnection(function (err, conn) {
  console.log(conn);
  console.log(err);
});


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

router.post('/signUp', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var email = req.body.email;
    var shortname = req.body.shortname;
    var pass = sha1(req.body.password);

    test = {};
    var podaci = {
      'password': pass,
      'shortname': shortname,
      'firstname': '',
      'lastname': '',
      'street': '',
      'zipcode': '',
      'place': '',
      'email': email,
      'telephone': '',
      'mobile': '',
      'birthday': '',
      'incompanysince': '',
      'type': 0,
      'storeId': 0,
      'active': 0,
      'img': ''
    };
    console.log(podaci);

    conn.query("SELECT * FROM users WHERE email=?", [req.body.email],
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        }
        console.log(rows);
        if (rows.length >= 1) {
          test.success = false;
          test.info = 'Email already exists!';
          res.json(test);
        } else {
          conn.query("insert into users SET ?", podaci, function (err, rows) {
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
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              console.log(err);
            }
          });
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post('/createTask', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    test = {};
    console.log(req);
    var podaci = {
      'creator_id': req.body.creator_id,
      'customer_id': req.body.user.id,
      'title': req.body.title,
      'colorTask': req.body.colorTask,
      'start': req.body.start,
      'end': req.body.end,
      'telephone': req.body.telephone,
      'therapy_id': req.body.therapy_id
    };
    console.log(podaci);


    conn.query("insert into tasks SET ?", podaci, function (err, rows) {
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
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post('/updateTask', function (req, res, next) {
  req.setMaxListeners(0);
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    test = {};

    var customer_id = null;
    console.log(req.body);
    if(req.body.user !== undefined && req.body.user.id !== undefined) {
      customer_id = req.body.user.id
    } else {
      customer_id = req.body.customer_id;
    }

    var data = {
      'id': req.body.id,
      'creator_id': req.body.creator_id,
      'customer_id': customer_id,
      'title': req.body.title,
      'colorTask': req.body.colorTask,
      'start': req.body.start,
      'end': req.body.end,
      'telephone': req.body.telephone
    };
    console.log(data);
    conn.query("update tasks SET ? where id = '" + data.id + "'", [data], function (err, rows) {
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
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteTask/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;

    console.log('usao sam u verifikaciju!');
    console.log(reqObj);
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from tasks where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.get('/getTasks', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("SELECT * from tasks", function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getTasksForUser/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var id = req.params.id;
    conn.query("SELECT * from tasks where creator_id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getTasksForStore/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var id = req.params.id;
    conn.query("SELECT * from users u join tasks t on u.id = t.creator_id where u.storeId = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {
        console.log(rows);
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/login', (req, res, next) => {
  console.log('usao sam u login!');
  try {
    var reqObj = req.body;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        console.log(reqObj.username, sha1(reqObj.password));
        conn.query("SELECT * FROM users WHERE email=? AND password=?", [reqObj.email, sha1(reqObj.password)],
          function (err, rows, fields) {
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            }
            if (rows.length >= 1 && rows[0].active === 1) {
              conn.release();
              //req.session.user = rows[0];
              //req.session.auth = true;

              res.send({
                login: true,
                notVerified: rows[0].active,
                user: rows[0].shortname,
                type: rows[0].type,
                id: rows[0].id,
                storeId: rows[0].storeId
              });
            } else {
              res.send({
                login: false
              });
            }
            /*else {
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

                                                   res.send({ login: true, notVerified: rows[0].active, user: rows[0].shortname, type: 0, id: rows[0].id, storeId: rows[0].storeId });
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



router.post('/createUser', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var user = req.body.username;
    var shortname = req.body.shortname;
    var pass = sha1(req.body.password);

    test = {};
    console.log(req.body.birthday);
    var podaci = {
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
      'storeId': req.body.storeId,
      'img': '',
      'active': 1
    };

    conn.query("SELECT * FROM users WHERE email=?", [req.body.email],
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        }
        if (rows.length >= 1) {
          test.success = false;
          test.info = 'Email already exists!';
          res.json(test);
        } else {
          console.log(podaci);
          console.log('usao sam ovde!');
          conn.query("insert into users SET ?", podaci, function (err, rows) {
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
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              console.log(err);
            }
          });
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});


router.get('/getUsers/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    console.log(id);
    conn.query("SELECT u.id, u.shortname, u.firstname, u.lastname, u.email, u.street, u.active from users u join store s on u.storeId = s.id where s.superadmin = ?", [id], function (err, rows) {
      conn.release();
      console.log(rows);
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getUsersInCompany/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from users where storeId = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getMe/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from users where id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getCompany/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from store where id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});


router.post('/createStore', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    test = {};
    var podaci = {
      'storename': req.body.storename,
      'street': req.body.street,
      'zipcode': req.body.zipcode,
      'place': req.body.place,
      'email': req.body.email,
      'telephone': req.body.telephone,
      'mobile': req.body.mobile,
      'comment': req.body.comment,
      'start_work': req.body.start_work,
      'end_work': req.body.end_work,
      'time_duration': req.body.time_duration,
      'time_therapy': req.body.time_therapy,
      'superadmin': req.body.superadmin
    };


    conn.query("SELECT * FROM store WHERE email=?", [req.body.email],
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        }
        console.log(rows);
        if (rows.length >= 1) {
          test.success = false;
          test.info = 'exist';
          res.json(test);
        } else {
          conn.query("insert into store SET ?", podaci, function (err, rows) {
            conn.release();
            if (!err) {
              if (!err) {
                test.id = rows.insertId;
                test.success = true;
              } else {
                test.success = false;
                test.info = 'notAdded';
              }
              res.json(test);
            } else {
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              console.log(err);
            }
          });
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/getStore/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from store where superadmin = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/updateStore', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var podaci = {
      'id': req.body.id,
      'storename': req.body.storename,
      'street': req.body.street,
      'zipcode': req.body.zipcode,
      'place': req.body.place,
      'email': req.body.email,
      'telephone': req.body.telephone,
      'mobile': req.body.mobile,
      'comment': req.body.comment,
      'start_work': req.body.start_work,
      'end_work': req.body.end_work,
      'time_duration': req.body.time_duration,
      'time_therapy': req.body.time_therapy,
      'superadmin': req.body.superadmin
    };


    conn.query("update store set ? where id = '" + req.body.id + "'", podaci,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteStore/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from store where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/createCustomer', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    test = {};
    var podaci = {
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
      'storeId': req.body.storeId
    };
    console.log(podaci);

    conn.query("SELECT * FROM customers WHERE shortname=?", [req.body.shortname],
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        }
        console.log(rows);
        if (rows.length >= 1) {
          test.success = false;
          test.info = 'Email already exists!';
          res.json(test);
        } else {
          conn.query("insert into customers SET ?", podaci, function (err, rows) {
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
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              console.log(err);
            }
          });
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/getCustomers/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from customers where storeId = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json(null);
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getCustomerWithId/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from customers where id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json(null);
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getDocuments/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from documents  where customer_id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
});

router.get('/deleteDocumentFromDatabase/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from documents where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/deleteDocument', function (req, res, next) {
  fs.unlinkSync(req.body.path, function (err) {
    if (err) {
      res(false);
    } else {
      res(true);
    }
  });
});

router.post('/download', function (req, res, next) {
  console.log(req);
  filepath = path.join(__dirname, './uploads') + '/' + req.body.filename;
  console.log(filepath);
  res.sendFile(filepath);
});


router.get('/activeUser/:id', function (req, res, next) {
  console.log("pozvano za edit!!!");
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    test = {};
    var id = req.params.id;

    conn.query("UPDATE users SET active = 1 where id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          test.success = true;
        } else {
          test.success = false;
        }
        res.json(test);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
});

router.post('/uploadImage', function (req, res, next) {
  console.log("pozvano za edit!!!");
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    test = {};
    console.log(req);
    var id = req.body.id;
    // console.log(fs);
    var img = fs.readFileSync("C:\\Users\\Aleksandar\\Pictures\\" + req.body.img);

    conn.query("UPDATE users SET img = ? where id = '" + id + "'", [img], function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          test = {
            'img': img
          };
        } else {
          test.success = false;
        }
        res.json(test);
        console.log("Usao sam u DB!!!!");
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });

  });
});

router.get('/deactiveUser/:id', function (req, res, next) {
  console.log("pozvano za edit!!!");
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    test = {};
    var id = req.params.id;

    conn.query("UPDATE users SET active = 0 where id = ?", [id], function (err, rows) {
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
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
});

router.post('/addUser', function (req, res, next) {
  console.log("pozvano!");
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
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


    conn.query("insert into users SET ?", podaci, function (err, rows) {
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
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
});

router.post('/updateUser', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var id = req.body.id;
    var response = null;
    var data = {
      'shortname': req.body.shortname,
      "password": sha1(req.body.password),
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "street": req.body.street,
      "zipcode": req.body.zipcode,
      "email": req.body.email,
      "telephone": req.body.telephone,
      "mobile": req.body.mobile,
      "birthday": req.body.birthday,
      "incompanysince": req.body.incompanysince,
      "type": req.body.type,
      "storeId": req.body.storeId,
      "active": req.body.active
    };



    conn.query("update users SET ? where id = '" + id + "'", data, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response = false;
        }
        res.json(response);
        console.log("Usao sam u DB!!!!");
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
});

router.get('/deleteUser/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from users where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.send(true);
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

router.get('/deleteCustomer/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;

    console.log('usao sam u verifikaciju!');
    console.log(reqObj);
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from customers where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateCustomer', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    test = {};
    var id = req.body.id;

    conn.query("UPDATE customers SET ? where id = '" + id + "'", [req.body], function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          test.success = true;
        } else {
          test.success = false;
        }
        res.json(test);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
});

router.get('/korisnik/verifikacija/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;

    console.log('usao sam u verifikaciju!');
    console.log(reqObj);
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("UPDATE users SET active='1' WHERE SHA1(email)='" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.writeHead(302, {
                'Location': '/login'
              });
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
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("UPDATE users SET password='" + reqObj + "' WHERE SHA1(email)='" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
            } else {
              res.writeHead(302, {
                'Location': '/changePassword'
              });
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
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("SELECT * FROM users u WHERE u.email=?", [reqObj.email],
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            }

            if (rows.length >= 1 && rows[0].active == '1') {
              res.send({
                exist: true,
                notVerified: false
              });
            } else if (rows.length >= 1) {
              res.send({
                exist: true,
                notVerified: true
              });
            } else {
              res.send({
                exist: false,
                notVerified: true
              });
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

    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        if (newPassword1 == newPassword2) {
          conn.query("UPDATE users SET password='" + sha1(newPassword1) + "' WHERE  sha1(email)='" + email + "'",
            function (err, rows, fields) {
              conn.release();
              if (err) {
                console.error("SQL error:", err);
                res.json({
                  "code": 100,
                  "status": "Error in connection database"
                });
                return next(err);
              } else {
                res.send({
                  "code": "true",
                  "message": "The password is success change!"
                });
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

router.get('/getUserWithID/:userid', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from users where id = ?", [req.params.userid], function (err, rows) {
      conn.release();
      if (!err) {
        var test = [];

        for (var i = 0; i < rows.length; i++) {
          test[i] = rows[i];
          console.log(rows[i]);
        }

        console.log("Ovdee :D");
        console.log(test);
        res.json(test);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });

    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
});

router.post('/setWorkTimeForUser', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = {};
    console.log(req);
    var date = {
      'user_id': req.body.user_id,
      'dateChange': req.body.dateChange,
      'monday': req.body.monday,
      'tuesday': req.body.tuesday,
      'wednesday': req.body.wednesday,
      'thursday': req.body.thursday,
      'friday': req.body.friday,
      'color': req.body.color
    };
    console.log(date);


    conn.query("insert into work SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/getWorkTimeForUser/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from work where user_id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/updateWorkTimeForUser', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = {};
    console.log(req);
    var date = {
      'user_id': req.body.user_id,
      'dateChange': req.body.dateChange,
      'monday': req.body.monday,
      'tuesday': req.body.tuesday,
      'wednesday': req.body.wednesday,
      'thursday': req.body.thursday,
      'friday': req.body.friday,
      'color': req.body.color
    };
    console.log(date);


    conn.query("update work SET ? where id = '" + req.body.id + "'", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/getWorkandTaskForUser/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from work where user_id = ?", [id], function (err, work) {
      console.log(work);
      if (!err) {
        conn.query("select * from tasks where creator_id = ?", [id], function (err, events) {
          conn.release();
          if (!err) {

            res.json({
              events: events,
              workTime: work
            });
          } else {
            res.json({
              "code": 100,
              "status": "Error in connection database"
            });
          }
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addComplaint', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'customer_id': req.body.customer_id,
      'employee_name': req.body.employee_name,
      'date': req.body.date,
      'complaint': req.body.complaint,
      'complaint_title': req.body.complaint_title,
      'comment': req.body.comment,
      'therapies': req.body.therapies,
      'therapies_title': req.body.therapies_title,
      'cs': req.body.cs
    };
    console.log(date);


    conn.query("insert into complaint SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post('/updateComplaint', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'customer_id': req.body.customer_id,
      'employee_name': req.body.employee_name,
      'date': req.body.date,
      'complaint': req.body.complaint,
      'complaint_title': req.body.complaint_title,
      'comment': req.body.comment,
      'therapies': req.body.therapies,
      'therapies_title': req.body.therapies_title,
      'cs': req.body.cs
    };
    console.log(data);
    conn.query("update complaint set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteComplaint/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from complaint where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.get('/getComplaintForCustomer/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from complaint where customer_id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});


router.post('/addTherapy', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = {};
    console.log(req);
    var date = {
      'customer_id': req.body.customer_id,
      'date': req.body.date,
      'complaint': req.body.complaint,
      'complaint_title': req.body.complaint_title,
      'therapies': req.body.therapies,
      'therapies_title': req.body.therapies_title,
      'therapies_previous': req.body.therapies_previous,
      'therapies_previous_title': req.body.therapies_previous_title,
      'comment': req.body.comment,
      'cs': req.body.cs,
      'state': req.body.state,
      'em': req.body.em
    };
    console.log(date);


    conn.query("insert into therapy SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.id = -1;
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post('/updateTherapy', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'customer_id': req.body.customer_id,
      'date': req.body.date,
      'complaint': req.body.complaint,
      'complaint_title': req.body.complaint_title,
      'therapies': req.body.therapies,
      'therapies_title': req.body.therapies_title,
      'therapies_previous': req.body.therapies_previous,
      'therapies_previous_title': req.body.therapies_previous_title,
      'comment': req.body.comment,
      'cs': req.body.cs,
      'state': req.body.state,
      'em': req.body.em
    };
    console.log(data);
    conn.query("update therapy set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteTherapy/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from therapy where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.get('/getTherapyForCustomer/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from therapy where customer_id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });

    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getTherapy/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from therapy where id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {

        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });

    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.get('/getComplaintList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from complaint_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addComplaintList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("insert into complaint_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteComplaintList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from complaint_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateComplaintList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("update complaint_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// start therapy_list

router.get('/getTherapyList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from therapy_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addTherapyList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("insert into therapy_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteTherapyList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from therapy_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateTherapyList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("update therapy_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// end therapy_list

// start recommendation_list

router.get('/getRecommendationList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from recommendation_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addRecommendationList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("insert into recommendation_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteRecommendationList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from recommendation_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateRecommendationList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("update recommendation_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// end recommendation_list

// start relationship_list

router.get('/getRelationshipList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from relationship_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addRelationshipList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("insert into relationship_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteRelationshipList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from relationship_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateRelationshipList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("update relationship_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// end relationship_list

// start social_list

router.get('/getSocialList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from social_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addSocialList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("insert into social_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteSocialList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from social_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateSocialList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("update social_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// end social_list

// start doctor_list

router.get('/getDoctorList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from doctor_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addDoctorList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("insert into doctor_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteDoctorList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from doctor_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateDoctorList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("update doctor_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// end doctor_list

// start doctors_list

router.get('/getDoctorsList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from doctors_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addDoctorsList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'firstname': req.body.firstname,
      'lastname': req.body.lastname,
      'gender': req.body.gender,
      'street': req.body.street,
      'street_number': req.body.street_number,
      'zip_code': req.body.zip_code,
      'city': req.body.city,
      'telephone': req.body.telephone,
      'email': req.body.email,
      'doctor_type': req.body.doctor_type
    };

    conn.query("insert into doctors_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteDoctorsList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from doctors_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateDoctorsList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'firstname': req.body.firstname,
      'lastname': req.body.lastname,
      'gender': req.body.gender,
      'street': req.body.street,
      'street_number': req.body.street_number,
      'zip_code': req.body.zip_code,
      'city': req.body.city,
      'telephone': req.body.telephone,
      'email': req.body.email,
      'doctor_type': req.body.doctor_type
    };

    conn.query("update doctors_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// end doctors_list

// start therapies_list

router.get('/getTreatmentList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from treatment_list", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addTreatmentList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("insert into treatment_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteTreatmentList/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from treatment_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.post('/updateTreatmentList', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'title': req.body.title,
      'sequence': req.body.sequence
    };

    conn.query("update treatment_list set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// end doctors_list

// BASE DATA I

router.get('/getBaseDataOne/:id', function (req, res, next) {
  var id = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from base_one where customer_id = '" + id + "'", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addBaseDataOne', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'customer_id': req.body.customer_id,
      'recommendation': req.body.recommendation,
      'relationship': req.body.relationship,
      'social': req.body.social,
      'doctor': req.body.doctor,
      //'doctors': req.nody.doctors,
      'first_date': req.body.first_date
    };

    conn.query("insert into base_one SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post('/updateBaseDataOne', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'customer_id': req.body.customer_id,
      'recommendation': req.body.recommendation,
      'relationship': req.body.relationship,
      'social': req.body.social,
      'doctor': req.body.doctor,
      //'doctors': req.body.doctors,
      'first_date': req.body.first_date
    };

    conn.query("update base_one set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// END BASE DATA I

// BASE DATA II

router.get('/getBaseDataTwo/:id', function (req, res, next) {
  var id = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from base_two where customer_id = '" + id + "'", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addBaseDataTwo', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'customer_id': req.body.customer_id,
      'size': req.body.size,
      'weight': req.body.weight,
      'phone': req.body.phone,
      'mobile_phone': req.body.mobile_phone,
      'birthday': req.body.birthday,
      'childs': req.body.childs,
      'notes': req.body.notes,
      'profession': req.body.profession,
      'useful': req.body.useful,
    };

    conn.query("insert into base_two SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post('/updateBaseDataTwo', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'customer_id': req.body.customer_id,
      'size': req.body.size,
      'weight': req.body.weight,
      'phone': req.body.phone,
      'mobile_phone': req.body.mobile_phone,
      'birthday': req.body.birthday,
      'childs': req.body.childs,
      'notes': req.body.notes,
      'profession': req.body.profession,
      'useful': req.body.useful,
    };

    conn.query("update base_two set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// END BASE DATA II

// PHYSICAL_ILLNESS

router.get('/getPhysicalIllness/:id', function (req, res, next) {
  var id = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    conn.query("select * from physical_illness where customer_id = '" + id + "'", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/addPhysicalIllness', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = null;
    console.log(req);
    var date = {
      'customer_id': req.body.customer_id,
      'internal_organs': req.body.internal_organs,
      'operations': req.body.operations,
      'previous_findings': req.body.previous_findings,
      'medicament': req.body.medicament,
      'allergies': req.body.allergies,
      'skin_sensitivity': req.body.skin_sensitivity,
      'pregnancy': req.body.pregnancy
    };

    conn.query("insert into physical_illness SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});


router.post('/updatePhysicalIllness', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'customer_id': req.body.customer_id,
      'internal_organs': req.body.internal_organs,
      'operations': req.body.operations,
      'previous_findings': req.body.previous_findings,
      'medicament': req.body.medicament,
      'allergies': req.body.allergies,
      'skin_sensitivity': req.body.skin_sensitivity,
      'pregnancy': req.body.pregnancy
    };

    conn.query("update physical_illness set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

// END PHYSICAL_ILLNESS

router.post('/insertFromExcel', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = {};
    var values = '';
    var columns = '';
    var table = req.body.table;
    console.log(req.body);
    for (let i = 0; i < req.body.columns.length; i++) {
      columns += req.body.columns[i] + ',';
    }
    columns = columns.substr(0, columns.length - 1);
    for (let i = 0; i < req.body.data.length; i++) {
      values += "('"
      for (let j = 0; j < req.body.columns.length; j++) {
        if(req.body.columns[j] === 'password') {
          values += sha1(req.body.data[i][req.body.columns[j]]) + "','";
        } else {
          values += req.body.data[i][req.body.columns[j]] + "','";
        }
      }
      values = values.substr(0, values.length - 2);
      values += "),"
    }

    values = values.substr(0, values.length - 1);
    conn.query("insert into " + table + "(" + columns + ") values " + values + ';', function (err, rows, fields) {
      conn.release();
      if (err) {
        console.error("SQL error:", err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        response = true;
        res.send(response);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post('/createVaucher', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    response = {};
    console.log(req);
    var data = {
      'date': req.body.date,
      'amount': req.body.amount,
      'date_redeemed': req.body.date_redeemed,
      'customer': req.body.customer,
      'comment': req.body.comment,
      'customer_name': req.body.customer_name,
      'superadmin': req.body.superadmin
    };


    conn.query("insert into vaucher SET ?", data, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        console.log(err);
      }
    });
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.get('/deleteVaucher/:id', (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error('SQL Connection error: ', err);
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return next(err);
      } else {
        conn.query("delete from vaucher where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              console.error("SQL error:", err);
              res.json({
                "code": 100,
                "status": "Error in connection database"
              });
              return next(err);
            } else {
              res.json(true);
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

router.get('/getVauchers/:id', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }
    var id = req.params.id;
    conn.query("SELECT * from vaucher where superadmin = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
      }
    });


    conn.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });

});

router.post('/updateVaucher', function (req, res, next) {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    var response = null;
    var data = {
      'id': req.body.id,
      'date': req.body.date,
      'amount': req.body.amount,
      'date_redeemed': req.body.date_redeemed,
      'customer': req.body.customer,
      'customer_name': req.body.customer_name,
      'comment': req.body.comment
    };


    conn.query("update vaucher set ? where id = '" + req.body.id + "'", data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          console.error("SQL error:", err);
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          return next(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
    conn.on('error', function (err) {
      console.log("[mysql error]", err);
    });
  });
});

module.exports = router;
