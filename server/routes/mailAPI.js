require("dotenv").config();
var express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
var sha1 = require("sha1");
var hogan = require("hogan.js");
var fs = require("fs");
const mysql = require("mysql");
var url = require("url");
const logger = require("./logger");
const winston = require("winston");


var link = process.env.link_api;
var linkClient = process.env.link_client;
var loginLink = process.env.link_client_login;
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

const logFormatter = winston.format.printf((info) => {
  let { timestamp, level, stack, message } = info;
  message = stack || message;
  return `${timestamp} ${level}: ${message}`;
});

const logToConsole = winston.createLogger({
  level: 'info',
  format: winston.format.errors({ stack: true }),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple(), winston.format.timestamp(), logFormatter),
    }),
  ],
});

// var connection = mysql.createPool({
//   host: "116.203.85.82",
//   user: "appprodu_appproduction",
//   password: "CJr4eUqWg33tT97mxPFx",
//   database: "appprodu_management",
// });

var connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

var smtpTransport = nodemailer.createTransport({
  host: "116.203.85.82",
  secure: false,
   port: 587,
   auth: {
      user: "support@app-production.eu",
      pass: "Iva#$2019#$",
   },
});


//local purpose
//  var smtpTransport = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   tls: {
//     rejectUnauthorized: false,
//   },
//   debug: true,
//   ssl: true,
//   auth: {
//     user: "clinicnode2022@gmail.com",  // real email address
//     pass: "vfuvxgwdfrvestvd" // app password for clinicnode2022@gmail.com email
//   }
// });



// production
// var smtpTransport = nodemailer.createTransport({
//   host: "116.203.85.82",
//   port: 25,
//   secure: false,
//   tls: {
//     rejectUnauthorized: false,
//   },
//   auth: {
//     user: "support@app-production.eu",
//     pass: "])3!~0YFU)S]",
//   },
// });


//slanje maila pri registraciji

router.post("/send", function (req, res) {
  var confirmTemplate = fs.readFileSync(
    "./server/routes/templates/confirmMail.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(confirmTemplate);
  var verificationLinkButton =
    link + "korisnik/verifikacija/" + sha1(req.body.email);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectConfirmMail,
    html: compiledTemplate.render({
      firstName: req.body.shortname,
      verificationLink: verificationLinkButton,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForConfirmMail:
      req.body.language?.introductoryMessageForConfirmMail,
      confirmMailButtonText: req.body.language?.confirmMailButtonText,
      unsubscribeMessage: req.body.language?.unsubscribeMessage,
      unsubscribeHere: req.body.language?.unsubscribeHere,
      unsubscribeLink: req.body.unsubscribeLink,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    console.log(response);
    if (error) {
      logger.log(
        "error",
        `Error to sent mail for VERIFICATION MAIL on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.end("error");
    } else {
      logger.log(
        "info",
        `Sent mail for VERIFICATION MAIL for USER: ${req.body.shortname} on EMAIL: ${req.body.email}`
      );
      res.end("sent");
    }
  });
});

router.post("/sendCustomerVerificationMail", function (req, res) {
  connection.getConnection(function (err, conn) {
    var confirmTemplate = fs.readFileSync(
      "./server/routes/templates/infoForCreatedPatientAccountViaForm.hjs",
      "utf-8"
    );
    var compiledTemplate = hogan.compile(confirmTemplate);
    var verificationLinkButton =
      link + "customerVerificationMail/" + sha1(req.body.email);

    conn.query(
      "SELECT m.*, u.* from mail_patient_created_account_via_form m join users_superadmin u on m.superadmin = u.id  where m.superadmin = ?",
      [req.body.storeId],
      function (err, mailMessage, fields) {
        conn.release();
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.language?.subjectConfirmMail,
          html: compiledTemplate.render({
            firstName: req.body.firstname,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForConfirmMail: mail.mailMessage
              ? mail.mailMessage
              : req.body.language?.introductoryMessageForConfirmMail,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          console.log(response);
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for VERIFICATION MAIL on EMAIL: ${req.body.email}. Error: ${error}`
            );
            res.end("error");
          } else {
            logger.log(
              "info",
              `Sent mail for VERIFICATION MAIL for USER: ${req.body.shortname} on EMAIL: ${req.body.email}`
            );
            res.end("sent");
          }
        });
      }
    );
  });
});

router.post("/send1", function (req, res) {
  console.log(req.body.email);
  let broj = sha1(req.body.email);
  let mail =
    "Thank you for registering. We require that you validate your registration to ensure that the email address you entered was correct. This protects against unwanted spam and malicious abuse. Your username is: " +
    req.body.shortname;
  mail += ".\nTo activate your account, simply click on the following link:\n";
  //mail+="http://147.91.204.116:2030/api/korisnik/verifikacija/" + broj + "\n";
  // mail += "http://app-production.eu:8080/api/korisnik/verifikacija/" + broj + "\n";
  mail += "http://localhost:3000/api/korisnik/verifikacija/" + broj + "\n";
  mail += "Best regards,\nTuina Praxis!";

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: "Confirm registration",
    text: mail,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    console.log(response);
    if (error) {
      console.log(error);
      res.end("error");
    } else {
      console.log("Message sent: " + response.message);
      res.end("sent");
    }
  });
});

//slanje mail-a kada korisnik zaboravi lozinku

router.post("/forgotmail", function (req, res) {
  var confirmTemplate = fs.readFileSync(
    "./server/routes/templates/forgotMail.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(confirmTemplate);
  var verificationLinkButton =
    loginLink + "/changePassword/" + sha1(req.body.email);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectForgotMail,
    html: compiledTemplate.render({
      firstName: req.body.shortname,
      verificationLink: verificationLinkButton,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForForgotMail:
      req.body.language?.introductoryMessageForForgotMail,
      forgotMailButtonText: req.body.language?.forgotMailButtonText,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "error",
        `Error to sent mail for FORGOT PASSWORD on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.end(error);
    } else {
      logger.log(
        "info",
        `Sent mail for FORGOT PASSWORD for USER: ${req.body.shortname} on EMAIL: ${req.body.email}`
      );
      res.end("sent");
    }
  });
});

router.post("/sendMailToMultiple", function (req, res) {

  const superadminId = req.body.id;

  connection.getConnection(function (err, conn) {
    var confirmTemplate = fs.readFileSync(
      "./server/routes/templates/multipleRecepient.hjs",
      "utf-8"
    );
    var compiledTemplate = hogan.compile(confirmTemplate);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }

    conn.query("select * from mail_multiple_recepient where superadmin = ?", superadminId, function(err, message) {
      conn.release();
      if (err) {
        console.log("SQL error:", err);
      }
      let mail = {};
      let signatureAvailable = false;
      if (message.length > 0) {
        mail = message[0];
        if (mail.signatureAvailable) {
          signatureAvailable = true;
        }
      }
      console.log(mail);

      var mailOptions = {
        from: '"ClinicNode" support@app-production.eu',
        to: req.body.emails,
        subject: req.body.subject ? req.body.subject : mail.mailSubject,
        html: compiledTemplate.render({
          initialGreeting: mail.mailInitialGreeting ? mail.mailInitialGreeting : req.body.language?.initialGreeting,
          finalGreeting: mail.mailFinalGreeting ? mail.mailFinalGreeting : '',
          signature: signatureAvailable && mail.mailSignature ? mail.mailSignature : "",
          finalMessageForMultipleRecepient: req.body.message ? req.body.message : mail.mailMessage,
          thanksForUsing: mail.mailThanksForUsing ? mail.mailThanksForUsing : req.body.language?.thanksForUsing,
          ifYouHaveQuestion: mail.mailIfYouHaveQuestion ? mail.mailIfYouHaveQuestion : req.body.language?.ifYouHaveQuestion,
          emailAddress: req.body.language?.emailAddress,
          notReply: mail.mailNotReply ? mail.mailNotReply : "",
          copyRight: mail.mailCopyRight ? mail.mailCopyRight : "",
          signatureTelephone: signatureAvailable && mail.signatureTelephone ? mail.signatureTelephone + " " : "",
          signatureMobile: signatureAvailable && mail.signatureMobile ? mail.signatureMobile : "",
          signatureEmail: signatureAvailable && mail.signatureEmail ? mail.signatureEmail : "",
        })
      };

      smtpTransport.sendMail(mailOptions, function (error, response) {
        console.log(response);
        if (error) {
          console.log(error);
          res.end("error");
        } else {
          console.log("Message sent: " + response.message);
          res.end("sent");
        }
      });
    })
  })
});

router.post("/askQuestion", function (req, res) {
  let ime = req.body.ime;
  let naslov = req.body.naslov;
  let email = req.body.email;
  let poruka = req.body.poruka;
  let mail = "Posiljalac: \n" + ime + "\n" + email + "\n\n" + poruka;

  console.log(mail);
  var mailOptions = {
    to: "support@app-production.eu",
    subject: naslov,
    text: mail,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
      res.send({ message: "error" });
    } else {
      console.log("Message sent: " + response.message);
      res.send({ message: "sent" });
    }
  });
});

router.post("/sendConfirmArrivalAgain", function (req, res) {
  connection.getConnection(function (err, conn) {
    var confirmTemplate = fs.readFileSync(
      "./server/routes/templates/confirmArrival.hjs",
      "utf-8"
    );
    var compiledTemplate = hogan.compile(confirmTemplate);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }

    conn.query(
      "SELECT c.shortname, c.email as customer_email, s.*, t.start, t.end, u.lastname, u.firstname, th.therapies_title, c.storeId from customers c join tasks t on c.id = t.customer_id join therapy th on t.therapy_id = th.id join store s on t.storeId = s.id  join users u on t.creator_id = u.id join event_category e on t.colorTask = e.id where c.id = ? and t.id = ? and e.allowSendInformation = 1 and c.active = 1",
      [req.body.customer_id, req.body.id],
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
        }

        rows.forEach(function (to, i, array) {
          console.log(to);
          conn.query(
            "select * from mail_confirm_arrival where superadmin = ?",
            [to.storeId],
            function (err, mailMessage, fields) {
              conn.release();
              if (err) {
                console.error("SQL error:", err);
              }
              var mail = {};
              var signatureAvailable = false;
              if (mailMessage.length > 0) {
                mail = mailMessage[0];
                if (mail.signatureAvailable) {
                  signatureAvailable = true;
                }
              }
              console.log(mail);
              var verificationLinkButton =
                link + "task/confirmationArrival/" + req.body.id;
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
              console.log(day);
              var month = monthNames[convertToDateStart.getMonth()];
              var day = convertToDateStart.getDate();
              var start =
                (startHours < 10 ? "0" + startHours : startHours) +
                ":" +
                (startMinutes < 10 ? "0" + startMinutes : startMinutes);
              var end =
                (endHours < 10 ? "0" + endHours : endHours) +
                ":" +
                (endMinutes < 10 ? "0" + endMinutes : endMinutes);
              var mailOptions = {
                from: '"ClinicNode" support@app-production.eu',
                subject: mail.mailSubject
                  ? mail.mailSubject
                  : req.body.language?.subjectConfirmArrival,
                html: compiledTemplate.render({
                  firstName: to.shortname,
                  verificationLink: verificationLinkButton,
                  date: mail.mailDate ? date : "",
                  start: mail.mailTime ? start + " - " : "",
                  end: mail.mailTime ? end : "",
                  therapy: to.therapies_title,
                  storename: mail.mailClinic ? to.storename : "",
                  doctor: to.lastname + " " + to.firstname,
                  month: month,
                  day: day,
                  initialGreeting: mail.mailInitialGreeting
                    ? mail.mailInitialGreeting
                    : req.body.language?.initialGreeting,
                  finalGreeting: mail.mailFinalGreeting
                    ? mail.mailFinalGreeting
                    : req.body.language?.finalGreeting,
                  signature:
                    signatureAvailable && mail.mailSignature
                      ? mail.mailSignature
                      : "",
                  thanksForUsing: mail.mailThanksForUsing
                    ? mail.mailThanksForUsing
                    : req.body.language?.thanksForUsing,
                  websiteLink: req.body.language?.websiteLink,
                  ifYouHaveQuestion: mail.mailIfYouHaveQuestion
                    ? mail.mailIfYouHaveQuestion
                    : req.body.language?.ifYouHaveQuestion,
                  emailAddress: req.body.language?.emailAddress,
                  notReply: mail.mailNotReply
                    ? mail.mailNotReply
                    : req.body.language?.notReply,
                  copyRight: mail.mailCopyRight
                    ? mail.mailCopyRight
                    : req.body.language?.copyRight,
                  introductoryMessageForConfirmArrival:
                    req.body.language?.introductoryMessageForConfirmArrival,
                  dateMessage: mail.mailDate ? mail.mailDate + " " : "",
                  timeMessage: mail.mailTime ? mail.mailTime + " " : "",
                  storeLocation: mail.mailClinic ? mail.mailClinic + " " : "",
                  therapyMessage: req.body.language?.therapyMessage,
                  doctorMessage: req.body.language?.doctorMessage,
                  finalMessageForConfirmArrival: mail.mailMessage
                    ? mail.mailMessage
                    : req.body.language?.finalMessageForConfirmArrival,
                  confirmArrivalButtonText:
                    req.body.language?.confirmArrivalButtonText,
                  signatureAddress:
                    signatureAvailable &&
                    mail.signatureAddress &&
                    (to.street || to.zipcode || to.place)
                      ? mail.signatureAddress +
                        "\n" +
                        to.street +
                        "\n" +
                        to.zipcode +
                        " " +
                        to.place
                      : "",
                  signatureTelephone:
                    signatureAvailable &&
                    mail.signatureTelephone &&
                    to.telephone
                      ? mail.signatureTelephone + " " + to.telephone
                      : "",
                  signatureMobile:
                    signatureAvailable && mail.signatureMobile && to.mobile
                      ? mail.signatureMobile + " " + to.mobile
                      : "",
                  signatureEmail:
                    signatureAvailable && mail.signatureEmail && to.email
                      ? mail.signatureEmail + " " + to.email
                      : "",
                }),
              };
              mailOptions.to = to.customer_email;
              smtpTransport.sendMail(mailOptions, function (error, response) {
                console.log(response);
                if (error) {
                  logger.log(
                    "error",
                    `Error to sent mail for CONFIRM ARRIVAL for USER: ${to.shortname} on EMAIL: ${to.email}. Error: ${error}`
                  );
                  res.send(error);
                } else {
                  logger.log(
                    "info",
                    `Sent mail for CONFIRM ARRIVAL for USER: ${to.shortname} on EMAIL: ${to.email}`
                  );
                  res.send(true);
                }
              });
            }
          );
        });
      }
    );
    conn.on("error", function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post("/sendPatientFormRegistration", function (req, res) {
  var patientRegistrationFormTemplate = fs.readFileSync(
    "./server/routes/templates/patientRegistrationForm.hjs",
    "utf-8"
  );
  var patientRegistrationForm = hogan.compile(patientRegistrationFormTemplate);
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.* from customers c join mail_patient_form_registration mr on c.storeId = mr.superadmin where c.email = ? and c.active = 1",
      [req.body.email],
      function (err, mailMessage, fields) {
        conn.release();
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.langauge?.subjectFormRegistration,
          html: patientRegistrationForm.render({
            link: req.body.link,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForPatientRegistrationForm: mail.mailMessage
              ? mail.mailMessage
              : req.body.language
                  ?.introductoryMessageForPatientRegistrationForm,
            openForm: req.body.language?.openForm,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };

        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for PATIENT FORM REGISTRATION on EMAIL: ${req.body.email}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent mail for PATIENT FORM REGISTRATION on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendInfoToPatientForCreatedAccount", function (req, res) {
  console.log(req.body);
  var infoCreatedTemplate = fs.readFileSync(
    "./server/routes/templates/infoForCreatedPatientAccount.hjs",
    "utf-8"
  );
  var infoForCreatedAccount = hogan.compile(infoCreatedTemplate);
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.* from customers c join mail_patient_created_account mr on c.storeId = mr.superadmin where c.id = ?",
      [req.body.id],
      function (err, mailMessage, fields) {
        conn.release();
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.language?.subjectCreatedPatientForm,
          html: infoForCreatedAccount.render({
            firstName: req.body.firstname,
            email: req.body.email,
            password: req.body.password,
            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForCreatedPatientAccount: mail.mailMessage
              ? mail.mailMessage
              : req.body.language?.introductoryMessageForCreatedPatientAccount,
            linkForLogin: req.body.language?.linkForLogin,
            emailForLogin: req.body.language?.emailForLogin,
            passwordForLogin: req.body.language?.passwordForLogin,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "info",
              `Error to sent info for patient created account on EMAIL: ${req.body.email}. Error: ${error}`
            );

            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent info for patient created account on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendInfoForApproveReservation", function (req, res) {
  console.log(req.body);
  var infoForApproveReservationTemplate = fs.readFileSync(
    "./server/routes/templates/infoForApproveReservation.hjs",
    "utf-8"
  );
  var infoForApproveReservation = hogan.compile(
    infoForApproveReservationTemplate
  );
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.*, s.* from tasks t join mail_approve_reservation mr on t.superadmin = mr.superadmin join store s on t.storeId = s.id where t.id = ?",
      [req.body.id],
      function (err, mailMessage, fields) {
        conn.release();
        if (err) {
          res.json(false);
        }
        var mail = {};
        console.log(mailMessage);
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.language?.subjectApproveReservation,
          html: infoForApproveReservation.render({
            firstName: req.body.firstname,
            email: req.body.email,
            password: req.body.password,
            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForApproveReservation: mail.mailMessage
              ? mail.mailMessage
              : req.body.language?.introductoryMessageForApproveReservation,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for APPROVE RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent mail for APPROVE RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendInfoForDenyReservation", function (req, res) {
  var infoForDenyReservationTemplate = fs.readFileSync(
    "./server/routes/templates/infoForDenyReservation.hjs",
    "utf-8"
  );
  var infoForDenyReservation = hogan.compile(infoForDenyReservationTemplate);
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.*, s.* from tasks t join mail_deny_reservation mr on t.superadmin = mr.superadmin join store s on t.storeId = s.id where t.id = ?",
      [req.body.id],
      function (err, mailMessage, fields) {
        conn.release();
        if (err) {
          res.json(false);
        }
        console.log(mailMessage);
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.language?.subjectDenyReservation,
          html: infoForDenyReservation.render({
            firstName: req.body.firstname,
            email: req.body.email,
            password: req.body.password,
            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForDenyReservation: mail.mailMessage
              ? mail.mailMessage
              : req.body.language?.introductoryMessageForDenyReservation,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for DENY RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent mail for DENY RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendEmailToPatient", function (req, res) {
  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body?.subject,
    text: req.body?.content,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "error",
        `Error to sent personal mail to patient on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.send(false);
    } else {
      logger.log(
        "info",
        `Sent personal mail to patient on EMAIL: ${req.body.email}`
      );
      res.send(true);
    }
  });
});

router.post("/sendReminderViaEmailManual", function (req, res) {
  var reminderTemplate = fs.readFileSync(
    "./server/routes/templates/reminderForReservation.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(reminderTemplate);

  var convertToDateStart = new Date(req.body.start);
  var convertToDateEnd = new Date(req.body.end);
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

  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.*, s.*, s.place as store_place from customers c join mail_reminder_message mr on c.storeId = mr.superadmin join store s on c.storeId = s.superadmin join tasks t on s.id = t.storeId join event_category e on t.colorTask = e.id where c.id = ? and s.id = ? and t.id = ? and e.allowSendInformation = 1 and c.active = 1",
      [req.body.id, req.body.storeId, req.body.taskId],
      function (err, mailMessage, fields) {
        conn.release();
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject,
          html: compiledTemplate.render({
            initialGreeting: mail?.mailInitialGreeting
              ? mail?.mailInitialGreeting
              : req.body.language?.initialGreeting,
            introductoryMessageForReminderReservation: mail?.mailMessage
              ? mail?.mailMessage
              : req.body.language?.introductoryMessageForReminderReservation,
            dateMessage: mail.mailDate ? mail.mailDate + " " : "",
            timeMessage: mail.mailTime ? mail.mailTime + " " : "",
            storeLocation: mail.mailClinic ? mail.mailClinic + " " : "",
            therapyMessage: mail?.mailTherapy
              ? mail?.mailTherapy
              : req.body.language?.therapyMessage,
            doctorMessage: mail?.mailDoctor
              ? mail?.mailDoctor
              : req.body.language?.doctorMessage,
            finalGreeting: mail?.mailFinalGreeting
              ? mail?.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature:
              signatureAvailable && mail.mailSignature
                ? mail.mailSignature
                : "",
            thanksForUsing: mail?.mailThanksForUsing
              ? mail?.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            ifYouHaveQuestion: mail?.mailIfYouHaveQuestion
              ? mail?.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            notReply: mail?.mailNotReply
              ? mail?.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail?.mailCopyRight
              ? mail?.mailCopyRight
              : req.body.language?.copyRight,
            firstName: req.body.shortname,
            date: mail.mailDate ? date : "",
            start: mail.mailTime ? start + " - " : "",
            end: mail.mailTime ? end : "",
            storename: mail.mailClinic ? req.body.storename : "",
            month: month,
            day: day,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };

        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "info",
              `Error to sent reminder via email on EMAIL: ${req.body.email}. Error: ${error}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent reminder via email on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/confirmUserViaMacAddress", function (req, res) {
  var template = fs.readFileSync(
    "./server/routes/templates/approveUserAccess.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(template);

  var convertToDate = new Date(req.body.date);
  var hours = convertToDate.getHours();
  var minutes = convertToDate.getMinutes();
  var date =
    convertToDate.getDate() +
    "." +
    (convertToDate.getMonth() + 1) +
    "." +
    convertToDate.getFullYear();
  var day = convertToDate.getDate();
  var month = monthNames[convertToDate.getMonth()];
  var year = convertToDate.getFullYear();
  var start =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (hours < 10 ? "0" + hours : hours);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: "Neue Geräte bestätigen",
    html: compiledTemplate.render({
      initialGreeting: "Hallo",
      introductoryMessage:
        "Wir möchten Sie darüber informieren, dass wir versuchen, uns mit den untenstehenden Informationen anzumelden. Bitte greifen Sie auf das Dashboard zu und gewähren Sie Zugriff!",
      nameMessage: "Name",
      macAddressMessage: "MAC-Adresse",
      datumMessage: "Registrierungsdatum",
      name: req.body.firstname + " " + req.body.lastname,
      macAddress: req.body.mac_address,
      date: day + "." + month + "." + year + " - " + hours + ":" + minutes,
      month: month,
      day: day,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "info",
        `Error to sent reminder via email on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.send(false);
    } else {
      logger.log("info", `Sent reminder via email on EMAIL: ${req.body.email}`);
      res.send(true);
    }
  });
});
router.post("/sendLastMinuteOfferMails", function (req, res){
  var clientLink = process.env.link_client;
  var clientLinkArray=clientLink.split("/");
  clientLinkArray.pop();
  clientLink = clientLinkArray.join("/")
  console.log(clientLink);
  var lastMinuteOfferTemplate = fs.readFileSync(
    "./server/routes/templates/sendLastMinuteOfferMails.hjs",
    "utf-8"
  );
  var sendMassive = hogan.compile(lastMinuteOfferTemplate);

    connection.getConnection(function (err, conn) {
      conn.query(
        "select email, shortname from customers " +
          " where (email != '' and email IS NOT NULL) and active = 1 and id = " +
          Number(req.body.userId),
        function (err, rows) {
          conn.release();
          if (err) {
            logger.log("error", err);
            res.json(false);
          }
          

          rows.forEach(function (to, i, array) {
            console.log(to);
            var mailOptions = {
              from: '"ClinicNode" support@app-production.eu',
              to: to.email,
              subject: req.body.lastMinuteEMailSubject,
              html: sendMassive.render({
                firstName: to.shortname,
                initialGreeting: req.body.initialGreeting,
                introductoryMessageForFreeEvent: req.body.lastMinuteEMailMessage,
                offerLink: clientLink+"/dashboard/home/customers/last-minute-event?"+req.body.link,
                finalGreeting: req.body.finalGreeting,
                viewOffer: req.body.viewLastMinuteOffer,
                signature: req.body.signature,
                thanksForUsing: req.body.thanksForUsing,
                websiteLink: req.body.websiteLink,
                ifYouHaveQuestion: req.body.ifYouHaveQuestion,
                emailAddress: req.body.emailAddress,
                notReply: req.body.notReply,
                copyRight: req.body.copyRight,
              }),
            };
            smtpTransport.sendMail(mailOptions, function (error, response) {
              if (error) {
                logger.log("error", error);
              } else {
                logger.log(
                  "info",
                  `Sent mail for last minute offers on EMAIL: ${to.email}`
                );
              }
            });
          });
          res.send(true);
        }
      );
    });
});
router.post("/sendMassiveEMail", function (req, res) {
      var sendMassiveTemplate = fs.readFileSync(
        "./server/routes/templates/sendMassiveMails.hjs",
        "utf-8"
      );
      var sendMassive = hogan.compile(sendMassiveTemplate);
      var question = getSqlQueryMultiSelect(req.body);
      var joinTable = getJoinTable(req.body);

    if (req.body.message != "") {
            connection.getConnection(function (err, conn) {
      conn.query(
        "select distinct c.email, c.shortname, mm.* from customers c join mail_massive_message mm on c.storeId = mm.superadmin join store s on c.storeId = s.superadmin " +
          joinTable +
          " where c.sendMassiveEmail = 1 and (c.email != '' and c.email IS NOT NULL) and c.active = 1 and c.storeId = " +
          Number(req.body.superadmin) +
          " and " +
          question,
        function (err, rows) {
          conn.release();
          if (err) {
            logger.log("error HERE", err);
            res.json(err);
          }

          rows.forEach(function (to, i, array) {
            var mail = {};
            var signatureAvailable = false;
            mail = to;
            if (mail.signatureAvailable) {
              signatureAvailable = true;
            }
            console.log(to);
            var mailOptions = {
              from: '"ClinicNode" support@app-production.eu',
              to: to.email,
              subject: req.body.subject ? req.body.subject : mail.mailSubject,
              html: sendMassive.render({
                firstName: to.shortname,
                message: req.body.message,
                initialGreeting: mail.mailInitialGreeting
                  ? mail.mailInitialGreeting
                  : req.body.language?.initialGreeting,
                finalGreeting: mail.mailFinalGreeting
                  ? mail.mailFinalGreeting
                  : req.body.language?.finalGreeting,
                signature: !signatureAvailable
                  ? mail.mailSignature
                  : req.body.language?.signature,
                thanksForUsing: mail.mailThanksForUsing
                  ? mail.mailThanksForUsing
                  : req.body.language?.thanksForUsing,
                websiteLink: req.body.language?.websiteLink,
                ifYouHaveQuestion: mail.mailIfYouHaveQuestion
                  ? mail.mailIfYouHaveQuestion
                  : req.body.language?.ifYouHaveQuestion,
                emailAddress: req.body.language?.emailAddress,
                notReply: mail.mailNotReply
                  ? mail.mailNotReply
                  : req.body.language?.notReply,
                copyRight: mail.mailCopyRight
                  ? mail.mailCopyRight
                  : req.body.language?.copyRight,
                introductoryMessageForDenyReservation: mail.mailMessage
                  ? mail.mailMessage
                  : req.body.language?.introductoryMessageForDenyReservation,
                signature: mail.mailSignature ? mail.mailSignature : "",
                signatureCompanyName:
                  signatureAvailable && mail.signatureCompanyName
                    ? mail.signatureCompanyName
                    : "",
                signatureAddress1:
                  signatureAvailable && mail.signatureAddress1
                    ? mail.signatureAddress1
                    : "",
                signatureAddress2:
                  signatureAvailable && mail.signatureAddress2
                    ? mail.signatureAddress2
                    : "",
                signatureAddress3:
                  signatureAvailable && mail.signatureAddress3
                    ? mail.signatureAddress3
                    : "",
                signatureTelephone:
                  signatureAvailable && mail.signatureTelephone
                    ? mail.signatureTelephone
                    : "",
                signatureMobile:
                  signatureAvailable && mail.signatureMobile
                    ? mail.signatureMobile
                    : "",
                signatureEmail:
                  signatureAvailable && mail.signatureEmail
                    ? mail.signatureEmail
                    : "",

                unsubscribeMessage: req.body.language?.unsubscribeMessage,
                unsubscribeHere: req.body.language?.unsubscribeHere,
                unsubscribeLink: process.env.unsubscribeEmail + '/' + to.email,
              }),
            };
            smtpTransport.sendMail(mailOptions, function (error, response) {
              if (error) {
                //logger.log("error sendMail", error);
              logToConsole.error(error);
              } else {
                logger.log(
                  "info",
                  `Sent mail for marketing promotion on EMAIL: ${to.email}`
                );
              }
            });
          });
          res.send(true);
        }
      );
    });
  } else {
    logger.log(
      "error",
      `Client don't input message for send massive mails: ${req.body.email}`
    );
    res.send(false);
  }
});

function getSqlQueryMultiSelect(body) {
  var question = "";
  if (question) {
    question += " and ";
  }
  if (body.place) {
    if(body.place.length < 2) {
      if (question) {
        
        question += " and c.city = '" + body.place[0] + "'";
      } else {
        question += " c.city = '" + body.place[0] + "'";
      }
    }
    else {
      body.place.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (c.city = '" + item + "'";
            }
            else if(index === body.place.length - 1) {
              question += " or c.city = '" + item + "'" + ")";
            }
            else {
              question += " or c.city = '" + item + "'";
            }
          } else {
            question += " (c.city = '" + item + "'";
          }
        }
      })
    }
  }
  
  if (body.male && body.female) {
    var male = "'male'";
    var female = "'female'";
    if (question) {
      question += " and (c.gender = " + male;
      question += " or c.gender = " + female + ")";
    } else {
      question += "(c.gender = " + male;
      question += " or c.gender = " + female + ")";
    }
  } else {
    if (body.male) {
      if (question) {
        question += " and c.gender = 'male'";
      } else {
        question += "c.gender = 'male'";
      }
    } else if (body.female) {
      if (question) {
        question += " and c.gender = 'female'";
      } else {
        question += "c.gender = 'female'";
      }
    }
  }

  console.log(body);
  if (body.birthdayFrom) {
    if (question) {
      question += " and c.birthday >= '" + body.birthdayFrom + "'";
    } else {
      question += "c.birthday >= '" + body.birthdayFrom + "'";
    }
  }
  if (body.birthdayTo) {
    if (question) {
      question += " and c.birthday <= '" + body.birthdayTo + "'";
    } else {
      question += "c.birthday <= '" + body.birthdayTo + "'";
    }
  }

  if (body.category) {
    if(body.category.length < 2) {
      if (question) {
        question += " and t.colorTask = " + body.category[0];
      } else {
        question += " t.colorTask = " + body.category[0];
      }
    }
    else {
      body.category.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (t.colorTask = " + item;;
            }
            else if(index === body.category.length - 1) {
              question += " or t.colorTask = " + item + ")";
            }
            else {
              question += " or t.colorTask = " + item;
            }
          } else {
            question += " (t.colorTask = " + item;
          }
        }
      })
    }
  }

  if (body.start) {
    if (question) {
      question += " and t.start >= '" + body.start + "'";
    } else {
      question += " t.start >= '" + body.start + "'";
    }
  }

  if (body.end) {
    if (question) {
      question += " and t.end <= '" + body.end + "'";
    } else {
      question += " t.end <= '" + body.end + "'";
    }
  }

  if (body.creator_id) {
    if(body.creator_id.length < 2) {
      if (question) {
        question += " and t.creator_id = " + body.creator_id[0];
      } else {
        question += " t.creator_id = " + body.creator_id[0];
      }
    }
    else {
      body.creator_id.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (t.creator_id = " + item;;
            }
            else if(index === body.creator_id.length - 1) {
              question += " or t.creator_id = " + item + ")";
            }
            else {
              question += " or t.creator_id = " + item;
            }
          } else {
            question += " (t.creator_id = " + item;
          }
        }
      })
    }
  }

  if (body.store) {
    if(body.store.length < 2) {
      if (question) {
        question += " and t.storeId = " + body.store[0];
      } else {
        question += " t.storeId = " + body.store[0];
      }
    }
    else {
      body.store.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (t.storeId = " + item;;
            }
            else if(index === body.store.length - 1) {
              question += " or t.storeId = " + item + ")";
            }
            else {
              question += " or t.storeId = " + item;
            }
          } else {
            question += " (t.storeId = " + item;
          }
        }
      })
    }
  }

  if (body.recommendation) {
    if(body.recommendation.length < 2) {
      if (question) {
        question += " and bo.recommendation = " + body.recommendation[0];
      } else {
        question += " bo.recommendation = " + body.recommendation[0];
      }
    }
    else {
      body.recommendation.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (bo.recommendation = " + item;;
            }
            else if(index === body.recommendation.length - 1) {
              question += " or bo.recommendation = " + item + ")";
            }
            else {
              question += " or bo.recommendation = " + item;
            }
          } else {
            question += " (bo.recommendation = " + item;
          }
        }
      })
    }
  }

  if (body.relationship) {
    if(body.relationship.length < 2) {
      if (question) {
        question += " and bo.relationship = " + body.relationship[0];
      } else {
        question += " bo.relationship = " + body.relationship[0];
      }
    }
    else {
      body.relationship.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (bo.relationship = " + item;;
            }
            else if(index === body.relationship.length - 1) {
              question += " or bo.relationship = " + item + ")";
            }
            else {
              question += " or bo.relationship = " + item;
            }
          } else {
            question += " (bo.relationship = " + item;
          }
        }
      })
    }
  }

  if (body.social) {
    if(body.social.length < 2) {
      if (question) {
        question += " and bo.social = " + body.social[0];
      } else {
        question += " bo.social = " + body.social[0];
      }
    }
    else {
      body.social.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (bo.social = " + item;;
            }
            else if(index === body.social.length - 1) {
              question += " or bo.social = " + item + ")";
            }
            else {
              question += " or bo.social = " + item;
            }
          } else {
            question += " (bo.social = " + item;
          }
        }
      })
    }
  }

  if (body.doctor) {
    if(body.doctor.length < 2) {
      if (question) {
        question += " and bo.doctor = " + body.doctor[0];
      } else {
        question += " bo.doctor = " + body.doctor[0];
      }
    }
    else {
      body.doctor.forEach((item, index) => {
        if(item !== 0) {
          if (question) {
            if(index === 0) {
              question += " and (bo.doctor = " + item;;
            }
            else if(index === body.doctor.length - 1) {
              question += " or bo.doctor = " + item + ")";
            }
            else {
              question += " or bo.doctor = " + item;
            }
          } else {
            question += " (bo.doctor = " + item;
          }
        }
      })
    }
  }

  if (body.profession) {
    if (question) {
      question += " and bt.profession = " + body.profession;
    } else {
      question += " bt.profession = " + body.profession;
    }
  }

  if (body.childs) {
    if (question) {
      question += " and bt.childs = " + body.childs;
    } else {
      question += " bt.childs = " + body.childs;
    }
  }

  console.log(question);

  return question;
}

function getSqlQuery(body) {
  var question = "";
  if (question) {
    question += " and ";
  }
  if (body.place) {
    question = "c.city = '" + body.place + "'";
  }
  if (body.male && body.female) {
    var male = "'male'";
    var female = "'female'";
    if (question) {
      question += " and (c.gender = " + male;
      question += " or c.gender = " + female + ")";
    } else {
      question += "(c.gender = " + male;
      question += " or c.gender = " + female + ")";
    }
  } else {
    if (body.male) {
      if (question) {
        question += " and c.gender = 'male'";
      } else {
        question += "c.gender = 'male'";
      }
    } else if (body.female) {
      if (question) {
        question += " and c.gender = 'female'";
      } else {
        question += "c.gender = 'female'";
      }
    }
  }

  if (body.birthdayFrom) {
    if (question) {
      question += " and c.birthday >= '" + body.birthdayFrom + "'";
    } else {
      question += "c.birthday >= '" + body.birthdayFrom + "'";
    }
  }
  if (body.birthdayTo) {
    if (question) {
      question += " and c.birthday <= '" + body.birthdayTo + "'";
    } else {
      question += "c.birthday <= '" + body.birthdayTo + "'";
    }
  }

  if (body.category) {
    if (question) {
      question += " and t.colorTask = " + body.category;
    } else {
      question += " t.colorTask = " + body.category;
    }
  }

  if (body.start) {
    if (question) {
      question += " and t.start >= '" + body.start + "'";
    } else {
      question += " t.start >= '" + body.start + "'";
    }
  }

  if (body.end) {
    if (question) {
      question += " and t.end <= '" + body.end + "'";
    } else {
      question += " t.end <= '" + body.end + "'";
    }
  }

  if (body.creator_id) {
    if (question) {
      question += " and t.creator_id = " + body.creator_id;
    } else {
      question += " t.creator_id = " + body.creator_id;
    }
  }

  if (body.store) {
    if (question) {
      question += " and t.storeId = " + body.store;
    } else {
      question += " t.storeId = " + body.store;
    }
  }

  if (body.recommendation) {
    if (question) {
      question += " and bo.recommendation = " + body.recommendation;
    } else {
      question += " bo.recommendation = " + body.recommendation;
    }
  }

  if (body.relationship) {
    if (question) {
      question += " and bo.relationship = " + body.relationship;
    } else {
      question += " bo.relationship = " + body.relationship;
    }
  }

  if (body.social) {
    if (question) {
      question += " and bo.social = " + body.social;
    } else {
      question += " bo.social = " + body.social;
    }
  }

  if (body.doctor) {
    if (question) {
      question += " and bo.doctor = " + body.doctor;
    } else {
      question += " bo.doctor = " + body.doctor;
    }
  }

  if (body.profession) {
    if (question) {
      question += " and bt.profession = " + body.profession;
    } else {
      question += " bt.profession = " + body.profession;
    }
  }

  if (body.childs) {
    if (question) {
      question += " and bt.childs = " + body.childs;
    } else {
      question += " bt.childs = " + body.childs;
    }
  }

  return question;
}

function getJoinTable(body) {
  let joinTable = "";
  if (
    body.category ||
    body.start ||
    body.end ||
    body.creator_id ||
    body.store
  ) {
    joinTable += " join tasks t on c.id = t.customer_id";
  }

  if (body.recommendation || body.relationship || body.social || body.doctor) {
    joinTable += " join base_one bo on c.id = bo.customer_id";
  }

  if (body.profession || body.childs) {
    joinTable += " join base_two bt on c.id = bt.customer_id";
  }

  return joinTable;
}

router.post("/infoAboutConfirmDenyAccessDevice", function (req, res) {
  var template = fs.readFileSync(
    "./server/routes/templates/infoAboutUserAccess.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(template);
  console.log(req.body);
  var convertToDate = new Date(req.body.date);
  var hours = convertToDate.getHours();
  var minutes = convertToDate.getMinutes();
  var date =
    convertToDate.getDate() +
    "." +
    (convertToDate.getMonth() + 1) +
    "." +
    convertToDate.getFullYear();
  var day = convertToDate.getDate();
  var month = monthNames[convertToDate.getMonth()];
  var year = convertToDate.getFullYear();
  var start =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (hours < 10 ? "0" + hours : hours);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject:
      (req.body.access ? "Aktiviert" : "Erloschen") + " ist dein Profil!",
    html: compiledTemplate.render({
      initialGreeting: "Hallo",
      introductoryMessage:
        "Wir informieren Sie, dass Ihr Profil " +
        (req.body.access ? "Aktiviert" : "Erloschen"),
      nameMessage: "Name",
      macAddressMessage: "MAC-Adresse",
      datumMessage: "Registrierungsdatum",
      name: req.body.firstname + " " + req.body.lastname,
      macAddress: req.body.mac_address,
      date: day + "." + month + "." + year + " - " + hours + ":" + minutes,
      month: month,
      day: day,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "info",
        `Error to sent reminder via email on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.send(false);
    } else {
      logger.log("info", `Sent reminder via email on EMAIL: ${req.body.email}`);
      res.send(true);
    }
  });
});

router.sendVaucherToMail = (data) => {

  connection.getConnection(function (err, conn) {
    var confirmTemplate = fs.readFileSync(
      "./server/routes/templates/sendVaucher.hjs",
      "utf-8"
    );
    var infoForCreatedAccount = hogan.compile(confirmTemplate);

    conn.query(
      "SELECT * FROM users WHERE users.id = ?", data.user, function (err, row) {
        let user = row[0];
        conn.release();
        var mail = {};
        var signatureAvailable = false;
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: user.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : data.language?.subjectCreatedVaucher,
          html: infoForCreatedAccount.render({
            firstName: data.user_name,
            amount: data.amount,
            date_redeemed: data.date_redeemed,
            comment: data.comment,
            customer: data.customer,
            customer_name: data.customer_name,
            customer_consumer: data.customer_consumer,
            customer_consumer_name: data.customer_consumer_name,
            superadmin: data.superadmin,

            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : data.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : data.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : data.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : data.language?.thanksForUsing,
            websiteLink: data.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : data.language?.ifYouHaveQuestion,
            emailAddress: data.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : data.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : data.language?.copyRight,
              introductoryMessageForCreatedVaucher: mail.mailMessage
              ? mail.mailMessage
              : data.language?.introductoryMessageForCreatedVaucher,
            linkForLogin: data.language?.linkForLogin,
            emailForLogin: data.language?.emailForLogin,
            vaucherAmount: data.language?.amount,
            date_redeemedTitle: data.language?.date_redeemed,
            commentTitle: data.language?.comment,
            // customerTitle: data.language?.customer,
            customerBuysTitle: data.language?.customerBuys,
            // customer_consumerTitle: data.language?.customer_consumer,
            customerConsumerTitle: data.language?.customerConsumer,
            passwordForLogin: data.language?.passwordForLogin,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };

        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for VERIFICATION MAIL on EMAIL: ${user.email}. Error: ${error}`
            );
            res.end("error");
          } else {
            logger.log(
              "info",
              `Sent mail for VERIFICATION MAIL for USER: ${user.shortname} on EMAIL: ${user.email}`
            );
            res.end("sent");
          }
        });
      }
    );
  });
}

router.sendMailAdminInfo = (data) => {
  connection.getConnection(function (err, conn) {
    if(err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      return err;
    }
    var confirmTemplate = fs.readFileSync(
      "./server/routes/templates/infoForCreatedSuperadmin.hjs",
      "utf-8"
    );
    var infoForCreatedAccount = hogan.compile(confirmTemplate);
    // var verificationLinkButton =
    //   link + "customerVerificationMail/" + sha1(data.email);

    conn.query(
      "SELECT * FROM users_superadmin WHERE users_superadmin = ?",
      data.id,
      function (err, mailMessage, fields) {
        conn.release();
        var mail = {};
        var signatureAvailable = false;
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: data.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : data.language?.subjectCreatedPatientForm,
          html: infoForCreatedAccount.render({
            firstName: data.firstname,
            email: data.email,
            password: data.password,
            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : data.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : data.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : data.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : data.language?.thanksForUsing,
            websiteLink: data.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : data.language?.ifYouHaveQuestion,
            emailAddress: data.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : data.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : data.language?.copyRight,
            introductoryMessageForCreatedPatientAccount: mail.mailMessage
              ? mail.mailMessage
              : data.language?.introductoryMessageForCreatedPatientAccount,
            linkForLogin: data.language?.linkForLogin,
            emailForLogin: data.language?.emailForLogin,
            passwordForLogin: data.language?.passwordForLogin,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, res) {
          if(!res) {
            logger.log(
              "error",
              `Error to sent mail for VERIFICATION MAIL on EMAIL: ${data.email}. Error: Response object not defined`
            );
            return;
          }
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for VERIFICATION MAIL on EMAIL: ${data.email}. Error: ${error}`
            );
            res.json("error");
          } else {
            logger.log(
              "info",
              `Sent mail for VERIFICATION MAIL for USER: ${data.shortname} on EMAIL: ${data.email}`
            );
            res.json("sent");
          }
        });
      }
    );
  });
}

module.exports = router;
