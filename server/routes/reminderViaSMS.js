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
            "SELECT r.sms, c.telephone, c.mobile, c.shortname, s.storename, t.start, t.end, us.firstname, us.lastname, th.therapies_title, sr.*, e.allowSendInformation, sc.count, sc.superadmin FROM reminder r join tasks t on r.superadmin = t.superadmin join customers c on t.customer_id = c.id join store s on t.storeId = s.id join users us on t.creator_id = us.id join therapy th on t.therapy_id = th.id join sms_reminder_message sr on r.superadmin = sr.superadmin join event_category e on t.colorTask = e.id join sms_count sc on sr.superadmin = sc.superadmin where c.reminderViaSMS = 1 and r.sms = 1 and CAST(t.start AS DATE) = CAST((NOW() + interval 2 DAY) as DATE) and e.allowSendInformation = 1",
            function (err, rows, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
              if (rows.length > 0) {
                var smsCount = {};
                request(
                  link + "/getAvailableAreaCode",
                  function (error, response, codes) {
                    rows.forEach(function (to, i, array) {
                      if (!smsCount[to.superadmin]) {
                        smsCount[to.superadmin] = {
                          superadmin: to.superadmin,
                          count: to.count,
                        };
                      }
                      if (
                        to.sms !== null &&
                        to.sms === 1 &&
                        smsCount[to.superadmin].count > 0
                      ) {
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
                          var dateMessage = "";
                          var time = "";
                          var clinic = "";
                          if (to.signatureAvailable) {
                            if (
                              (to.street || to.zipcode || to.place) &&
                              to.smsSignatureAddress
                            ) {
                              signature +=
                                to.smsSignatureAddress +
                                " \n" +
                                to.street +
                                " \n" +
                                to.zipcode +
                                " " +
                                to.place +
                                "\n";
                            }
                            if (to.telephone && to.smsSignatureTelephone) {
                              signature +=
                                to.smsSignatureTelephone +
                                " " +
                                to.telephone +
                                " \n";
                            }
                            if (to.mobile && to.smsSignatureMobile) {
                              signature +=
                                to.smsSignatureMobile + " " + to.mobile + " \n";
                            }
                            if (to.email && to.smsSignatureEmail) {
                              signature +=
                                to.smsSignatureEmail + " " + to.email + " \n";
                            }
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
                            (startMinutes < 10
                              ? "0" + startMinutes
                              : startMinutes);
                          var end =
                            (endHours < 10 ? "0" + endHours : endHours) +
                            ":" +
                            (endMinutes < 10 ? "0" + endMinutes : endMinutes);

                          var language = JSON.parse(body)["config"];
                          if (to.smsDate) {
                            dateMessage = to.smsDate + " " + date + " \n";
                          }
                          if (to.smsTime) {
                            time = to.smsTime + " " + start + "-" + end + " \n";
                          }
                          if (to.smsClinic) {
                            clinic =
                              to.smsClinic + " " + to.storename + " \n\n";
                          }

                          var message =
                            (to.smsSubject
                              ? to.smsSubject
                              : language.initialGreetingSMSReminder) +
                            " " +
                            to.shortname +
                            ", \n" +
                            "\n" +
                            (to.smsMessage
                              ? to.smsMessage
                              : language.introductoryMessageForSMSReminderReservation) +
                            " \n" +
                            "\n" +
                            dateMessage +
                            time +
                            clinic;
                          var content =
                            "To: " +
                            phoneNumber +
                            "\r\n\r\n" +
                            message +
                            "\r\n" +
                            signature;
                          var fileName = "server/sms/" + phoneNumber + ".txt";
                          smsCount[to.superadmin].count = smsCount[to.superadmin].count - 1;
                          fs.writeFile(fileName, content, function (err) {
                            if (err) return; // logger.log("error", err);
                            /*logger.log(
                              "info",
                              "Sent AUTOMATE REMINDER to NUMBER: " + phoneNumber
                            );*/
                            ftpUploadSMS(fileName, phoneNumber + ".txt");
                          });
                        }
                      }
                    });
                    var objectArray = Object.entries(smsCount);
                    console.log("OBJECT");
                    console.log(objectArray);
                    for (var item of objectArray[0]) {
                      if (item.superadmin) {
                        console.log(item);
                        conn.query(
                          "update sms_count set count = ? where superadmin = ?",
                          [item.count, item.superadmin],
                          function (err, rows, fields) {}
                        );
                      }
                    }

                    conn.release();
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
