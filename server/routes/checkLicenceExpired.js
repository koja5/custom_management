require("dotenv").config();
const express = require("express");
const router = express.Router();
var sha1 = require("sha1");
const axios = require("axios");
const API = "https://jsonplaceholder.typicode.com";
const mysql = require("mysql");
var fs = require("fs");
const path = require("path");
var nodemailer = require("nodemailer");
var hogan = require("hogan.js");
var request = require("request");
const logger = require("./logger");

var link = process.env.link_api;
var reminderTemplate = fs.readFileSync(
  "./server/routes/templates/licenceExpired.hjs",
  "utf-8"
);
var compiledTemplate = hogan.compile(reminderTemplate);
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

var connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

var smtpTransport = nodemailer.createTransport({
  host: process.env.smtp_host,
  port: process.env.smtp_port,
  secure: process.env.smtp_secure,
  tls: {
    rejectUnauthorized: process.env.smtp_rejectUnauthorized,
  },
  auth: {
    user: process.env.smtp_user,
    pass: process.env.smtp_pass,
  },
});

function checkLicenceExpired() {
  connection.getConnection(function (err, conn, res) {
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }
    conn.query(
      "SELECT * from licence_per_user l join users_superadmin u on l.superadmin_id = u.id where DATEDIFF(l.expiration_date, CURDATE()) = 30 || DATEDIFF(l.expiration_date, CURDATE()) = 15 || DATEDIFF(l.expiration_date, CURDATE()) = 7 || DATEDIFF(l.expiration_date, CURDATE()) = 1",
      function (err, rows, fields) {
        console.log(rows);
        conn.release();
        if (err) {
          logger.log("error", err);
        }
        rows.forEach(function (to, i, array) {
          if (to.email !== null) {
            var expiration_date = new Date(to.expiration_date);
            var date =
              expiration_date.getDate() +
              "." +
              (expiration_date.getMonth() + 1) +
              "." +
              expiration_date.getFullYear();

            var signatureAvailable = false;
            if (to.signatureAvailable) {
              signatureAvailable = true;
            }
            var mailOptions = {
              from: '"ClinicNode" info@app-production.eu',
              subject: "Licence expired!",
              html: compiledTemplate.render({
                name: to.firstname,
                expiration_date: date,
              }),
            };

            mailOptions.to = to.email;
            smtpTransport.sendMail(mailOptions, function (error, response) {
              if (error) {
                logger.log(
                  "error",
                  `Error to sent automate EMAIL REMINDER to EMAIL: ${to.email}. Error: ${error}`
                );
              } else {
                logger.log(
                  "info",
                  `Success sent automate EMAIL REMINDER to EMAIL: ${to.email}.`
                );
              }
            });
          }
        });
      }
    );
  });
}

module.exports = checkLicenceExpired;
