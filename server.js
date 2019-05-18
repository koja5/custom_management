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

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({ secret: "management", resave: false, saveUninitialized: true, cookie: { maxAge: 1000 * 300 * 30 } }));
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