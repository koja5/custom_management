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
            "SELECT distinct c.*, sb.* from customers c join sms_birthday_congratulation sb on c.storeId = sb.superadmin where DAY(c.birthday + interval 1 DAY) = DAY(CURRENT_DATE()) and MONTH(c.birthday) = MONTH(CURRENT_DATE())",
            function (err, rows, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
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
                        var signature = "";
                        var dateMessage = "";
                        var time = "";
                        var clinic = "";
                        var language = JSON.parse(body)["config"];
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
                          if (to.storeTelephone && to.smsSignatureTelephone) {
                            signature +=
                              to.smsSignatureTelephone +
                              " " +
                              to.storeTelephone +
                              " \n";
                          }
                          if (to.storeMobile && to.smsSignatureMobile) {
                            signature +=
                              to.smsSignatureMobile +
                              " " +
                              to.storeMobile +
                              " \n";
                          }
                          if (to.email && to.smsSignatureEmail) {
                            signature +=
                              to.smsSignatureEmail + " " + to.email + " \n";
                          }
                        }

                        if (language?.smsSignaturePoweredBy) {
                          signature += language?.smsSignaturePoweredBy + " \n";
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

                        if (to.smsDate) {
                          dateMessage = to.smsDate + " " + date + " \n";
                        }
                        if (to.smsTime) {
                          time = to.smsTime + " " + start + "-" + end + " \n";
                        }
                        if (to.smsClinic) {
                          clinic = to.smsClinic + " " + to.storename + " \n\n";
                        }

                        var message =
                          (to.smsSubject
                            ? to.smsSubject
                            : language.initialGreetingSMSReminder) +
                          " " +
                          to.shortname +
                          ", \n" +
                          "\n" +
                          (to.smsMessage ? to.smsMessage : "") +
                          " \n" +
                          "\n" +
                          dateMessage +
                          time +
                          clinic;
                        const fullMessage = message + "\r\n" + signature;
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
