// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
//const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const session = require('express-session');
const morgan = require('morgan');
// Get our API routes
const api = require('./server/routes/api');
const accessControl = require('./server/routes/accessControl')
const mail = require('./server/routes/mailAPI');
const cors = require('cors')
const app = express();
var multer = require('multer');
const mysql = require('mysql');
var fs = require("fs");

var connection = mysql.createPool({
  host: '185.178.193.141',
  user: 'appproduction.',
  password: 'jBa9$6v7',
  database: 'management'
})

//for upload image
app.use(function (req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, './server/routes/uploads/'); //./src/assets/uploads
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
  }
});

var upload = multer({ //multer settings
  storage: storage
}).single('file');


app.post('/upload', function (req, res) {
  upload(req, res, function (err) {
    console.log(req);
    connection.getConnection(function (err, conn) {
      console.log(conn);
      if (err) {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return;
      }

      var test = {};
      var doc = {
        'customer_id': req.body.comments,
        'name': req.file.originalname,
        'type': req.file.mimetype,
        'size': req.file.size,
        'filename': req.file.filename,
        'path': req.file.path
      }

      conn.query("insert into documents SET ?", doc, function (err, rows) {
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
});


// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(session({
  secret: "management",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 300 * 30
  }
}));
// loguje svaki zahtev u konzolurs
app.use(morgan('dev'));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
app.use('/api', api);
app.use('/api', mail);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
