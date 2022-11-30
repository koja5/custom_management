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

function checkLicenceExpired() {
  connection.getConnection(function (err, conn, res) {
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
            "SELECT * from licence_per_user l join users_superadmin u on l.superadmin_id = u.id where DATEDIFF(l.expiration_date, CURDATE()) = 30 || DATEDIFF(l.expiration_date, CURDATE()) = 15 || DATEDIFF(l.expiration_date, CURDATE()) = 7 || DATEDIFF(l.expiration_date, CURDATE()) = 1",
            function (err, rows, fields) {
              console.log(rows);
              conn.release();
              if (err) {
                logger.log("error", err);
              }
              // rows.forEach(function (to, i, array) {
              //   if (to.email !== null) {
              //     var expiration_date = new Date(to.expiration_date);
              //     var date =
              //       expiration_date.getDate() +
              //       "." +
              //       (expiration_date.getMonth() + 1) +
              //       "." +
              //       expiration_date.getFullYear();

              //     var language = JSON.parse(body)["config"];
              //     var signatureAvailable = false;
              //     if (to.signatureAvailable) {
              //       signatureAvailable = true;
              //     }
              //     var mailOptions = {
              //       from: '"ClinicNode" info@app-production.eu',
              //       subject: "Licence expired!",
              //       text: "Licence expired!"
              //       // text: compiledTemplate.render({
              //       //   initialGreeting: to.initialGreeting
              //       //     ? to.initialGreeting
              //       //     : language.initialGreeting,
              //       //   introductoryMessageForReminderReservation: to.mailMessage
              //       //     ? to.mailMessage
              //       //     : language.introductoryMessageForReminderReservation,
              //       //   dateMessage: to.mailDate
              //       //     ? to.mailDate
              //       //     : language.dateMessage,
              //       //   timeMessage: to.mailTime
              //       //     ? to.mailTime
              //       //     : language.timeMessage,
              //       //   therapyMessage: to.mailTherapy
              //       //     ? to.mailTherapy
              //       //     : language.therapyMessage,
              //       //   doctorMessage: to.mailDoctor
              //       //     ? to.mailDoctor
              //       //     : language.doctorMessage,
              //       //   storeLocation: to.mailClinic
              //       //     ? to.mailClinic
              //       //     : language.storeLocation,
              //       //   finalGreeting: to.mailFinalGreeting
              //       //     ? to.mailFinalGreeting
              //       //     : language.finalGreeting,
              //       //   signature: !signatureAvailable
              //       //     ? to.mailSignature
              //       //       ? to.mailSignature
              //       //       : language.signature
              //       //     : "",
              //       //   thanksForUsing: to.mailThanksForUsing
              //       //     ? to.mailThanksForUsing
              //       //     : language.thanksForUsing,
              //       //   websiteLink: language?.websiteLink,
              //       //   ifYouHaveQuestion: to.mailIfYouHaveQuestion
              //       //     ? to.mailIfYouHaveQuestion
              //       //     : language.ifYouHaveQuestion,
              //       //   notReply: to.mailNotReply
              //       //     ? to.mailNotReply
              //       //     : language.notReply,
              //       //   copyRight: to.mailCopyRight
              //       //     ? to.mailCopyRight
              //       //     : language.copyRight,
              //       //   firstName: to.shortname,
              //       //   date: date,
              //       //   start: start,
              //       //   end: end,
              //       //   storename: to.storename,
              //       //   therapy: to.therapies_title,
              //       //   doctor: to.lastname + " " + to.firstname,
              //       //   month: month,
              //       //   day: day,
              //       //   signatureStreet:
              //       //     signatureAvailable && to.signatureStreet
              //       //       ? to.signatureStreet
              //       //       : "",
              //       //   signatureZipCode:
              //       //     signatureAvailable && to.signatureZipCode
              //       //       ? to.signatureZipCode
              //       //       : "",
              //       //   signaturePhone:
              //       //     signatureAvailable && to.signaturePhone
              //       //       ? to.signaturePhone
              //       //       : "",
              //       //   signatureEmail:
              //       //     signatureAvailable && to.signatureEmail
              //       //       ? to.signatureEmail
              //       //       : "",
              //       // }),
              //     };

              //     mailOptions.to = to.email;
              //     smtpTransport.sendMail(
              //       mailOptions,
              //       function (error, response) {
              //         if (error) {
              //           logger.log(
              //             "error",
              //             `Error to sent automate EMAIL REMINDER to EMAIL: ${to.email}. Error: ${error}`
              //           );
              //         } else {
              //           logger.log(
              //             "info",
              //             `Success sent automate EMAIL REMINDER to EMAIL: ${to.email}.`
              //           );
              //         }
              //       }
              //     );
              //   }
              // });
            }
          );
        }
      }
    );
  });
}

module.exports = checkLicenceExpired;
