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

var link = "http://localhost:3000/api/";
var reminderTemplate = fs.readFileSync(
  "./server/routes/templates/reminderForReservation.hjs",
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

function reminderViaEmail() {
  connection.getConnection(function (err, conn, res) {
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }
    request(
      link + "/getTranslationByCountryCode/RS",
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          conn.query(
            "SELECT c.email, c.shortname, s.storename, t.start, t.end, us.firstname, us.lastname, th.therapies_title FROM reminder r join tasks t on r.superadmin = t.superadmin join customers c on t.customer_id = c.id join store s on t.storeId = s.id join users us on t.creator_id = us.id join therapy th on t.therapy_id = th.id where r.email = 1 and CAST(t.start AS DATE) = CAST((NOW() + interval 2 DAY) as DATE)",
            function (err, rows, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
              console.log(rows);
              rows.forEach(function (to, i, array) {
                console.log(to.email && to.email === 1);
                if (to.email !== null) {
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
                    subject: language?.subjectForReminderReservation,
                    html: compiledTemplate.render({
                      initialGreeting: language?.initialGreeting,
                      introductoryMessageForReminderReservation:
                        language?.introductoryMessageForReminderReservation,
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
                      date: date,
                      start: start,
                      end: end,
                      storename: to.storename,
                      therapy: to.therapies_title,
                      doctor: to.lastname + " " + to.firstname,
                      month: month,
                      day: day,
                    }),
                  };

                  mailOptions.to = to.email;
                  smtpTransport.sendMail(
                    mailOptions,
                    function (error, response) {
                      console.log(response);
                      if (error) {
                        console.log(error);
                      } else {
                        console.log("Message sent: " + to.email);
                      }
                    }
                  );
                }
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

module.exports = reminderViaEmail;
