require("dotenv").config();
const mysql = require("mysql");
var fs = require("fs");
var nodemailer = require("nodemailer");
const logger = require("./logger");
var hogan = require("hogan.js");
var request = require("request");

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

function sendHappyBirthdayViaEmail() {
  var mailTemplate = fs.readFileSync(
    "./server/routes/templates/mailBirthdayCongratulation.hjs",
    "utf-8"
  );
  var mailRender = hogan.compile(mailTemplate);

  connection.getConnection(function (err, conn) {
    request(
      link + "/getTranslationByCountryCode/AT",
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          conn.query(
            /*"SELECT distinct c.*, mb.* from customers c join mail_birthday_congratulation mb on c.storeId = mb.superadmin where DAY(c.birthday + interval 1 DAY) = DAY(CURRENT_DATE()) and MONTH(c.birthday) = MONTH(CURRENT_DATE())",*/
            "SELECT distinct c.*, mb.* from customers c join mail_birthday_congratulation mb on c.storeId = mb.superadmin where DAY(c.birthday + interval 1 DAY) = DAY(CURRENT_DATE()) and MONTH(c.birthday) = MONTH(CURRENT_DATE())",
            function (err, rows) {
              if (err) {
                logger.log("error", err);
                res.json(false);
              }
              var language = JSON.parse(body)["config"];
              rows.forEach(function (to, i, array) {
                if (to.congratulationBirthday) {
                  var mail = {};
                  var signatureAvailable = false;
                  mail = to;
                  if (mail.signatureAvailable) {
                    signatureAvailable = true;
                  }
                  var mailOptions = {
                    from: '"ClinicNode" support@app-production.eu',
                    to: to.email,
                    subject: to.mailSubject
                      ? to.mailSubject
                      : language?.mailSubject,
                    html: mailRender.render({
                      firstName: to.shortname,
                      message: to.message,
                      initialGreeting: to.mailInitialGreeting
                        ? to.mailInitialGreeting
                        : language?.initialGreeting,
                      finalGreeting: to.mailFinalGreeting
                        ? to.mailFinalGreeting
                        : language?.finalGreeting,
                      signature: !signatureAvailable
                        ? signatureAvailable
                        : language?.signature,
                      thanksForUsing: to.mailThanksForUsing
                        ? to.mailThanksForUsing
                        : language?.thanksForUsing,
                      websiteLink: language?.websiteLink,
                      ifYouHaveQuestion: to.mailIfYouHaveQuestion
                        ? to.mailIfYouHaveQuestion
                        : language?.ifYouHaveQuestion,
                      notReply: to.mailNotReply
                        ? to.mailNotReply
                        : language?.notReply,
                      copyRight: to.mailCopyRight
                        ? to.mailCopyRight
                        : language?.copyRight,
                      message: to.mailMessage ? to.mailMessage : "",
                      signature: to.mailSignature ? to.mailSignature : "",
                      signatureCompanyName:
                        signatureAvailable && to.signatureCompanyName
                          ? to.signatureCompanyName
                          : "",
                      signatureAddress1:
                        signatureAvailable && to.signatureAddress1
                          ? to.signatureAddress1
                          : "",
                      signatureAddress2:
                        signatureAvailable && to.signatureAddress2
                          ? to.signatureAddress2
                          : "",
                      signatureAddress3:
                        signatureAvailable && to.signatureAddress3
                          ? to.signatureAddress3
                          : "",
                      signatureTelephone:
                        signatureAvailable && to.signatureTelephone
                          ? to.signatureTelephone
                          : "",
                      signatureMobile:
                        signatureAvailable && to.signatureMobile
                          ? to.signatureMobile
                          : "",
                      signatureEmail:
                        signatureAvailable && to.signatureEmail
                          ? to.signatureEmail
                          : "",
                    }),
                  };
                  smtpTransport.sendMail(
                    mailOptions,
                    function (error, response) {
                      if (error) {
                        logger.log("error", error);
                        response.send(false);
                      } else {
                        logger.log(
                          "info",
                          `Sent mail for marketing promotion on EMAIL: ${to.email}`
                        );
                        response.send(true);
                      }
                    }
                  );
                  logger.log(
                    "info",
                    `Sent mail for marketing promotion on EMAIL: ${to.email}`
                  );
                }
              });
              conn.release();
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
module.exports = sendHappyBirthdayViaEmail;
