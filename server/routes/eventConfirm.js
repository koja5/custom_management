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

var link = "http://localhost:3000/api/";
var confirmTemplate = fs.readFileSync('./server/routes/templates/confirmTemplate.hjs', 'utf-8');
var compiledTemplate = hogan.compile(confirmTemplate);

var connection = mysql.createPool({
  host: "185.178.193.141",
  user: "appproduction.",
  password: "jBa9$6v7",
  database: "management_prod"
});
var smtpTransport = nodemailer.createTransport({
  host: "78.47.206.131",
  port: 25,
  secure: false,
  // requireTLS: true,
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: "info@app-production.eu",
    pass: "jBa9$6v7"
  }
});

/*function confirm() {
  connection.getConnection(function(err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database"
      });
      return;
    }

    conn.query("SELECT * FROM users_superadmin where active = 1", function(
      err,
      rows,
      fields
    ) {
      if (err) {
        console.error("SQL error:", err);
        return next(err);
      }
      console.log(rows);
      rows.forEach(function(to, i, array) {
        var verificationLinkButton = link + "/korisnik/verifikacija/" + sha1(to.email);
        console.log(verificationLinkButton);
        var mailOptions = {
          from: "info@app-production.eu",
          subject: "Confirm registration",
          // text: 'test'
          html: compiledTemplate.render({firstName: to.shortname, verificationLink: link + sha1(to.email)})
        };
        mailOptions.to = to.email;
        smtpTransport.sendMail(mailOptions, function(error, response) {
          console.log(response);
          if (error) {
            console.log(error);
          } else {
            console.log("Message sent: " + response.message);
          }
        });
      });
    });
    conn.on("error", function(err) {
      console.log("[mysql error]", err);
    });
  });
}*/

function confirm() {
  connection.getConnection(function(err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database"
      });
      return;
    }

    conn.query("SELECT c.email, t.id FROM tasks t join customers c on t.customer_id = c.id where DATEDIFF(t.start, NOW()) = 3 and t.confirm = 0 order by t.start desc", function(
      err,
      rows,
      fields
    ) {
      if (err) {
        console.error("SQL error:", err);
      }
      console.log(rows);
      rows.forEach(function(to, i, array) {
        var verificationLinkButton = link + "task/confirmationArrival/" + to.id;
        console.log(verificationLinkButton);
        var mailOptions = {
          from: "info@app-production.eu",
          subject: "Confirm registration",
          // text: 'test'
          html: compiledTemplate.render({firstName: to.shortname, verificationLink: verificationLinkButton})
        };
        mailOptions.to = to.email;
        smtpTransport.sendMail(mailOptions, function(error, response) {
          console.log(response);
          if (error) {
            console.log(error);
          } else {
            console.log("Message sent: " + response.message);
          }
        });
      });
    });
    conn.on("error", function(err) {
      console.log("[mysql error]", err);
    });
  });
}

function confirm1() {
  connection.getConnection(function(err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database"
      });
      return;
    }

    conn.query("SELECT c.email FROM tasks t join customers c on t.customer_id = c.id where DATEDIFF(t.start, NOW()) = 2 order by t.start desc", function(
      err,
      rows,
      fields
    ) {
      if (err) {
        console.error("SQL error:", err);
      }
      console.log(rows);
      rows.forEach(function(to, i, array) {
        var verificationLinkButton = link + "/korisnik/verifikacija/" + sha1(to.email);
        console.log(verificationLinkButton);
        var mailOptions = {
          from: "info@app-production.eu",
          subject: "Confirm registration",
          // text: 'test'
          html: compiledTemplate.render({firstName: to.shortname, verificationLink: link + sha1(to.email)})
        };
        mailOptions.to = to.email;
        smtpTransport.sendMail(mailOptions, function(error, response) {
          console.log(response);
          if (error) {
            console.log(error);
          } else {
            console.log("Message sent: " + response.message);
          }
        });
      });
    });
    conn.on("error", function(err) {
      console.log("[mysql error]", err);
    });
  });
}

module.exports = confirm;
