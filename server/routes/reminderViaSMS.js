require("dotenv").config();
const express = require("express");
const router = express.Router();
var sha1 = require("sha1");
const axios = require("axios");
const API = "https://jsonplaceholder.typicode.com";
const mysql = require("mysql");
var fs = require("fs");
var nodemailer = require("nodemailer");
var hogan = require("hogan.js");
var request = require("request");
const logger = require("./logger");
const ftpUploadSMS = require("./ftpUploadSMS");

var link = process.env.link_api;
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

const messagebird = require("messagebird")("sbx8Desv4cXJdPMZf7GtBLs9P", null, [
  "ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX",
]);

function reminderViaSMS() {
  connection.getConnection(function (err, conn) {
    if (err) {
      console.log(err);
      return;
    }
    request(
      link + "/getTranslationByCountryCode/AT",
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          conn.query(
            "SELECT r.sms, c.telephone, c.mobile, c.shortname, s.storename, t.start, t.end, us.firstname, us.lastname, th.therapies_title, sr.smsSubject, sr.smsMessage, sr.smsDate, sr.smsTime, sr.smsClinic, sr.smsSignatureStreet, sr.smsSignatureZipCode, sr.smsSignaturePhone, sr.smsSignatureEmail FROM reminder r join tasks t on r.superadmin = t.superadmin join customers c on t.customer_id = c.id join store s on t.storeId = s.id join users us on t.creator_id = us.id join therapy th on t.therapy_id = th.id join sms_reminder_message sr on r.superadmin = sr.superadmin where c.reminderViaSMS = 1 and r.sms = 1 and CAST(t.start AS DATE) = CAST((NOW() + interval 2 DAY) as DATE)",
            function (err, rows, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
              console.log(rows);
              if (rows.length > 0) {
                request(
                  link + "/getAvailableAreaCode",
                  function (error, response, codes) {
                    rows.forEach(function (to, i, array) {
                      if (to.sms !== null && to.sms === 1) {
                        var phoneNumber = null;
                        if (to.telephone) {
                          phoneNumber = to.telephone;
                        } else if (to.mobile) {
                          phoneNumber = to.mobile;
                        }
                        if (
                          checkAvailableCode(phoneNumber, JSON.parse(codes))
                        ) {
                          var signature = "";
                          if (!to.smsSubject || !to.smsMessage) {
                            to.smsSubject =
                              language?.initialGreetingSMSReminder;
                            to.smsMessage =
                              language?.introductoryMessageForSMSReminderReservation;
                            to.smsDate = language?.dateMessage;
                            to.smsTime = language?.timeMessage;
                            to.smsClinic = language?.storeLocation;
                          } else {
                            if (to.smsSignatureStreet) {
                              signature += to.smsSignatureStreet + " \n";
                            }
                            if (to.smsSignatureZipCode) {
                              signature += to.smsSignatureZipCode + " \n";
                            }
                            if (to.smsSignaturePhone) {
                              signature += to.smsSignaturePhone + " \n";
                            }
                            if (to.smsSignatureEmail) {
                              signature += to.smsSignatureEmail + " \n";
                            }
                          }
                          console.log(rows);
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
                            (startMinutes < 10
                              ? "0" + startMinutes
                              : startMinutes);
                          var end =
                            (endHours < 10 ? "0" + endHours : endHours) +
                            ":" +
                            (endMinutes < 10 ? "0" + endMinutes : endMinutes);

                          var language = JSON.parse(body)["config"];

                          var message =
                            to?.smsSubject +
                            " " +
                            to.shortname +
                            ", \n" +
                            "\n" +
                            to?.smsMessage +
                            " \n" +
                            "\n" +
                            to?.smsDate +
                            ": " +
                            date +
                            " \n" +
                            to?.smsTime +
                            ": " +
                            start +
                            "-" +
                            end +
                            " \n" +
                            to?.smsClinic +
                            ": " +
                            to.storename;

                          var content =
                            "To: " + phoneNumber + "\r\n\r\n" + message;
                          var fileName = "server/sms/" + phoneNumber + ".txt";
                          console.log(content);
                          fs.writeFile(fileName, content, function (err) {
                            if (err) return logger.log("error", err);
                            /*logger.log(
                              "info",
                              "Sent AUTOMATE REMINDER to NUMBER: " + phoneNumber
                            );*/
                            ftpUploadSMS(fileName, phoneNumber + ".txt");
                          });
                        }
                      }
                    });
                  }
                );
              }
            }
          );
        }
      }
    );
  });
}

function checkAvailableCode(phone, codes) {
  for (let i = 0; i < codes.length; i++) {
    if (phone && phone.startsWith(codes[i].area_code)) {
      return true;
    }
  }
  return false;
}
module.exports = reminderViaSMS;
