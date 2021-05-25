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

const messagebird = require("messagebird")("A87RrSLj3wWPL0qj2X66fzqoN", null, [
  "ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX",
]);

function reminderViaSMS() {
  connection.getConnection(function (err, conn) {
    if (err) {
      console.log(err);
      return;
    }
    request(
      link + "/getTranslationByCountryCode/RS",
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          conn.query(
            "SELECT r.sms, c.telephone, c.mobile, c.shortname, s.storename, t.start, t.end, us.firstname, us.lastname, th.therapies_title FROM reminder r join tasks t on r.superadmin = t.superadmin join customers c on t.customer_id = c.id join store s on t.storeId = s.id join users us on t.creator_id = us.id join therapy th on t.therapy_id = th.id where r.email = 1 and CAST(t.start AS DATE) = CAST((NOW() + interval 2 DAY) as DATE)",
            function (err, rows, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
              console.log(rows);
              rows.forEach(function (to, i, array) {
                if (to.sms !== null && to.sms === 1) {
                  if (to.telephone || to.mobile) {
                    var phoneNumber = null;
                    if (to.telephone) {
                      phoneNumber = to.telephone;
                    } else if (to.mobile) {
                      phoneNumber = to.mobile;
                    }
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
                    messagebird.lookup.read(
                      phoneNumber,
                      process.env.COUNTRY_CODE,
                      function (err, response) {
                        console.log(err);
                        console.log(response);

                        if (err && err.errors[0].code == 21) {
                          // This error code indicates that the phone number has an unknown format
                          response.send(
                            "You need to enter a valid phone number!"
                          );
                        } else if (err) {
                          // Some other error occurred
                          response.send(
                            "Something went wrong while checking your phone number!"
                          );
                        } else if (response.type != "mobile") {
                          // The number lookup was successful but it is not a mobile number
                          response.send(
                            "You have entered a valid phone number, but it's not a mobile number! Provide a mobile number so we can contact you via SMS."
                          );
                        } else {
                          // Everything OK

                          var language = JSON.parse(body)["config"];
                          // Send scheduled message with MessageBird API
                          messagebird.messages.create(
                            {
                              originator: "ClinicNode",
                              recipients: [response.phoneNumber], // normalized phone number from lookup request
                              body:
                                language?.initialGreetingSMSReminder +
                                " " +
                                to.shortname +
                                ", \n" + "\n" +
                                language?.introductoryMessageForSMSReminderReservation +
                                " \n" + "\n" +
                                language?.dateMessage +
                                ": " +
                                date +
                                " \n" +
                                language?.timeMessage +
                                ": " +
                                start +
                                "-" +
                                end +
                                " \n" +
                                language?.therapyMessage +
                                ": " +
                                to.therapies_title +
                                " \n" +
                                language?.doctorMessage +
                                ": " +
                                to.lastname +
                                " " +
                                to.firstname +
                                " \n" +
                                language?.storeLocation +
                                ": " +
                                to.storename,
                            },
                            function (err, response) {
                              if (err) {
                                // Request has failed
                                console.log(err);
                              } else {
                                console.log(
                                  "Sent message to " + response.phoneNumber
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
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

module.exports = reminderViaSMS;
