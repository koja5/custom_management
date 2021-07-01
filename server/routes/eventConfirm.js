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

var link = "http://localhost:3000/api/";
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
var confirmTemplate = fs.readFileSync(
  "./server/routes/templates/confirmArrival.hjs",
  "utf-8"
);
var compiledTemplate = hogan.compile(confirmTemplate);

var connection = mysql.createPool({
  host: "185.178.193.141",
  user: "appproduction.",
  password: "jBa9$6v7",
  database: "management_prod",
});

var smtpTransport = nodemailer.createTransport({
  host: "116.203.85.82",
  port: 25,
  secure: false,
  // requireTLS: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: "info@app-production.eu",
    pass: "jBa9$6v7",
  },
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
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }
    request(
      link + "/getTranslationByCountryCode/AT",
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          conn.query(
            "SELECT c.email, c.shortname, s.storename, t.id, t.start, t.end, th.therapies_title, us.lastname, us.firstname FROM tasks t join customers c on t.customer_id = c.id join therapy th on t.therapy_id = th.id join store s on t.storeId = s.id join users us on t.creator_id = us.id where DATEDIFF(t.start, NOW()) = 2 and t.confirm = 0 order by t.start desc",
            function (err, rows, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
              console.log(rows);
              rows.forEach(function (to, i, array) {
                var verificationLinkButton =
                  link + "task/confirmationArrival/" + to.id;
                var convertToDateStart = new Date(to.start);
                var convertToDateEnd = new Date(to.end);
                var startHours = convertToDateStart.getHours();
                var startMinutes = convertToDateStart.getMinutes();
                var endHours = convertToDateEnd.getHours();
                var endMinutes = convertToDateEnd.getMinutes();
                var date =
                  convertToDateStart.getDate() +
                  "." +
                  (convertToDateStart.getMonth() + 1) +
                  "." +
                  convertToDateStart.getFullYear();
                var day = convertToDateStart.getDate();
                var month = monthNames[convertToDateStart.getMonth()];
                var start =
                  (startHours < 10 ? "0" + startHours : startHours) +
                  ":" +
                  (startMinutes < 10 ? "0" + startMinutes : startMinutes);
                var end =
                  (endHours < 10 ? "0" + endHours : endHours) +
                  ":" +
                  (endMinutes < 10 ? "0" + endMinutes : endMinutes);
                var language = JSON.parse(body)["config"];
                var mailOptions = {
                  from: '"ClinicNode" info@app-production.eu',
                  subject: language?.subjectConfirmArrival,
                  html: compiledTemplate.render({
                    initialGreeting: language?.initialGreeting,
                    introductoryMessageForConfirmArrival:
                      language?.introductoryMessageForConfirmArrival,
                    dateMessage: language?.dateMessage,
                    timeMessage: language?.timeMessage,
                    therapyMessage: language?.therapyMessage,
                    doctorMessage: language?.doctorMessage,
                    storeLocation: language?.storeLocation,
                    finalGreeting: language?.finalGreeting,
                    signature: language?.signature,
                    thanksForUsing: language?.thanksForUsing,
                    ifYouHaveQuestion: language?.ifYouHaveQuestion,
                    notReply: language?.notReply,
                    copyRight: language?.copyRight,
                    firstName: to.shortname,
                    finalMessageForConfirmArrival:
                      language?.finalMessageForConfirmArrival,
                    confirmArrivalButtonText:
                      language?.confirmArrivalButtonText,
                    verificationLink: verificationLinkButton,
                    date: date,
                    start: start,
                    end: end,
                    therapy: to.therapies_title,
                    doctor: to.lastname + " " + to.firstname,
                    storename: to.storename,
                    month: month,
                    day: day,
                  }),
                };
                mailOptions.to = to.email;
                smtpTransport.sendMail(mailOptions, function (error, response) {
                  console.log(response);
                  if (error) {
                    logger.log("error", `Error to sent CONFIRM ARRIVAL request to EMAIL: ${to.email}. Error: ${error}`);
                  } else {
                    logger.log("info", `Sent CONFIRM ARRIVAL request to EMAIL: ${to.email}`);
                  }
                });
              });
            }
          );
        }
      }
    );
    conn.on("error", function (err) {
      console.log("[mysql error]", err);
    });
  });
}

function confirm1() {
  connection.getConnection(function (err, conn) {
    console.log(conn);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }

    conn.query(
      "SELECT c.email FROM tasks t join customers c on t.customer_id = c.id where DATEDIFF(t.start, NOW()) = 2 order by t.start desc",
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
        }
        console.log(rows);
        rows.forEach(function (to, i, array) {
          var verificationLinkButton =
            link + "/korisnik/verifikacija/" + sha1(to.email);
          console.log(verificationLinkButton);
          var mailOptions = {
            from: "info@app-production.eu",
            subject: "Confirm registration",
            // text: 'test'
            html: compiledTemplate.render({
              firstName: to.shortname,
              verificationLink: link + sha1(to.email),
            }),
          };
          mailOptions.to = to.email;
          smtpTransport.sendMail(mailOptions, function (error, response) {
            console.log(response);
            if (error) {
              console.log(error);
            } else {
              console.log("Message sent: " + response.message);
            }
          });
        });
      }
    );
    conn.on("error", function (err) {
      console.log("[mysql error]", err);
    });
  });
}

module.exports = confirm;
