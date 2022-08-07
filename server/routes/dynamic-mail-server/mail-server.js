require("dotenv").config();
var express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
var hogan = require("hogan.js");
var fs = require("fs");

/*var smtpTransport = nodemailer.createTransport({
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
});*/

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akojicpmf@gmail.com",
    pass: "vrbovac12345",
  },
});

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

router.post("/sendMail", function (req, res) {
  var confirmTemplate = fs.readFileSync(
    "./server/routes/templates/" + req.body.template,
    "utf-8"
  );
  var compiledTemplate = hogan.compile(confirmTemplate);
  var mailOptions = {
    from: req.body?.sender
      ? '"' + req.body.sender + '"' + process.env.smtp_user
      : '"KidsNode"' + process.env.smtp_user,
    to: "kojaaa95@gmail.com",
    subject: req.body.subject,
    html: compiledTemplate.render(req.body.fields),
  };

  console.log(mailOptions);

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      res.end(false);
    } else {
      res.end(true);
    }
  });
});

module.exports = router;
