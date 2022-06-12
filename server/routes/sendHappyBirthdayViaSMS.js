require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
var fs = require("fs");
var nodemailer = require("nodemailer");
var request = require("request");
const logger = require("./logger");
const sendSmsFromMail = require("./ftpUploadSMS");

var link = process.env.link_api;

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

function sendHappyBirthdayViaSMS() {
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
            // "SELECT distinct c.*, sb.* from customers c join sms_birthday_congratulation sb on c.storeId = sb.superadmin where DAY(c.birthday + interval 1 DAY) = DAY(CURRENT_DATE()) and MONTH(c.birthday) = MONTH(CURRENT_DATE())",
            "SELECT distinct c.*, sb.* from customers c join sms_birthday_congratulation sb on c.storeId = sb.superadmin where DAY(c.birthday) = DAY(CURRENT_DATE()) and MONTH(c.birthday) = MONTH(CURRENT_DATE())",
            function (err, rows, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
              console.log(rows);
              if (rows.length > 0 && rows[0].congratulationBirthday === 1) {
                request(
                  link + "/getAvailableAreaCode",
                  function (error, response, codes) {
                    rows.forEach(function (to, i, array) {
                      var phoneNumber = null;
                      if (to.telephone) {
                        phoneNumber = to.telephone;
                      } else if (to.mobile) {
                        phoneNumber = to.mobile;
                      }
                      if (checkAvailableCode(phoneNumber, JSON.parse(codes))) {
                        var language = JSON.parse(body)["config"];
                        var message =
                          (to.initialGreeting
                            ? to.initialGreeting
                            : language.initialGreetingSMSReminder) +
                          " " +
                          to.shortname +
                          ", \n \n" +
                          to.smsSubject;
                        var signature = "";
                        if (to.signatureAvailable) {
                          if (to.smsSignatureCompanyName) {
                            signature += to.smsSignatureCompanyName + "\n";
                          }
                          if (to.smsSignatureAddress1) {
                            signature += to.smsSignatureAddress1 + "\n";
                          }
                          if (to.smsSignatureAddress2) {
                            signature += to.smsSignatureAddress2 + "\n";
                          }
                          if (to.smsSignatureAddress3) {
                            signature += to.smsSignatureAddress3 + "\n";
                          }
                          if (to.smsSignatureTelephone) {
                            signature += to.smsSignatureTelephone + " \n";
                          }
                          if (to.smsSignatureMobile) {
                            signature += to.smsSignatureMobile + " \n";
                          }
                          if (to.smsSignatureEmail) {
                            signature += to.smsSignatureEmail + " \n";
                          }
                        }

                        if (language?.smsSignaturePoweredBy) {
                          signature += language?.smsSignaturePoweredBy + " \n";
                        }

                        const fullMessage = message + "\n\n" + signature;
                        console.log(fullMessage);
                        sendSmsFromMail(phoneNumber, fullMessage);
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
module.exports = sendHappyBirthdayViaSMS;
