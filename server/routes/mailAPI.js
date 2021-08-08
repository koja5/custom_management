var express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
var sha1 = require("sha1");
var hogan = require("hogan.js");
var fs = require("fs");
const mysql = require("mysql");
var url = require("url");
const logger = require("./logger");

var link = "http://localhost:3000/api/";
var loginLink = "http://localhost:4200/login";

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

/*var smtpTransport = nodemailer.createTransport({
  host: "116.203.85.82",
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: "support@app-production.eu",
    pass: "Iva#$20191#$2019",
  },
});*/

var smtpTransport = nodemailer.createTransport({
  host: "116.203.85.82",
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
      user: "support@app-production.eu",
      pass: "Iva#$2019#$",
  },
})

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
    subject: req.body.req.body.language?.subjectConfirmMail,
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
      "SELECT c.shortname, c.email, s.storename, t.start, t.end, u.lastname, u.firstname, th.therapies_title from customers c join tasks t on c.id = t.customer_id join therapy th on t.therapy_id = th.id join store s on t.storeId = s.id  join users u on t.creator_id = u.id where c.id = '" +
        req.body.customer_id +
        "' and t.id = '" +
        req.body.id +
        "'",
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
        }
        console.log(rows);
        rows.forEach(function (to, i, array) {
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
            subject: req.body.language?.subjectConfirmArrival,
            html: compiledTemplate.render({
              firstName: to.shortname,
              verificationLink: verificationLinkButton,
              date: date,
              start: start,
              end: end,
              therapy: to.therapies_title,
              storename: to.storename,
              doctor: to.lastname + " " + to.firstname,
              month: month,
              day: day,
              initialGreeting: req.body.language?.initialGreeting,
              finalGreeting: req.body.language?.finalGreeting,
              signature: req.body.language?.signature,
              thanksForUsing: req.body.language?.thanksForUsing,
              websiteLink: req.body.language?.websiteLink,
              ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
              emailAddress: req.body.language?.emailAddress,
              notReply: req.body.language?.notReply,
              copyRight: req.body.language?.copyRight,
              introductoryMessageForConfirmArrival:
                req.body.language?.introductoryMessageForConfirmArrival,
              dateMessage: req.body.language?.dateMessage,
              timeMessage: req.body.language?.timeMessage,
              storeLocation: req.body.language?.storeLocation,
              therapyMessage: req.body.language?.therapyMessage,
              doctorMessage: req.body.language?.doctorMessage,
              finalMessageForConfirmArrival:
                req.body.language?.finalMessageForConfirmArrival,
              confirmArrivalButtonText:
                req.body.language?.confirmArrivalButtonText,
            }),
          };
          mailOptions.to = to.email;
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
  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.langauge?.subjectFormRegistration,
    html: patientRegistrationForm.render({
      link: req.body.link,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForPatientRegistrationForm:
        req.body.language?.introductoryMessageForPatientRegistrationForm,
      openForm: req.body.language?.openForm,
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
});

router.post("/sendInfoToPatientForCreatedAccount", function (req, res) {
  console.log(req.body);
  var infoCreatedTemplate = fs.readFileSync(
    "./server/routes/templates/infoForCreatedPatientAccount.hjs",
    "utf-8"
  );
  var infoForCreatedAccount = hogan.compile(infoCreatedTemplate);
  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectCreatedPatientForm,
    html: infoForCreatedAccount.render({
      firstname: req.body.firstname,
      email: req.body.email,
      password: req.body.password,
      loginLink: loginLink,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForCreatedPatientAccount:
        req.body.language?.introductoryMessageForCreatedPatientAccount,
      linkForLogin: req.body.language?.linkForLogin,
      emailForLogin: req.body.language?.emailForLogin,
      passwordForLogin: req.body.language?.passwordForLogin,
    }),
  };
  console.log(mailOptions);

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
  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectApproveReservation,
    html: infoForApproveReservation.render({
      firstname: req.body.firstname,
      email: req.body.email,
      password: req.body.password,
      loginLink: loginLink,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForApproveReservation:
        req.body.language?.introductoryMessageForApproveReservation,
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
});

router.post("/sendInfoForDenyReservation", function (req, res) {
  var infoForDenyReservationTemplate = fs.readFileSync(
    "./server/routes/templates/infoForDenyReservation.hjs",
    "utf-8"
  );
  var infoForDenyReservation = hogan.compile(infoForDenyReservationTemplate);
  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectDenyReservation,
    html: infoForDenyReservation.render({
      firstname: req.body.firstname,
      email: req.body.email,
      password: req.body.password,
      loginLink: loginLink,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForDenyReservation:
        req.body.language?.introductoryMessageForDenyReservation,
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

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectForReminderReservation,
    html: compiledTemplate.render({
      initialGreeting: req.body.language?.initialGreeting,
      introductoryMessageForReminderReservation:
        req.body.language?.introductoryMessageForReminderReservation,
      dateMessage: req.body.language?.dateMessage,
      timeMessage: req.body.language?.timeMessage,
      therapyMessage: req.body.language?.therapyMessage,
      doctorMessage: req.body.language?.doctorMessage,
      storeLocation: req.body.language?.storeLocation,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      firstName: req.body.shortname,
      date: date,
      start: start,
      end: end,
      storename: req.body.storename,
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

module.exports = router;
