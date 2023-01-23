require("dotenv").config();
const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");
var nodemailer = require("nodemailer");
const logger = require("./logger");

var FTPAccessData = {
  host: process.env.ftp_host,
  port: process.env.ftp_port,
  user: process.env.ftp_user,
  password: process.env.ftp_password,
};

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

// local purpose only
var smtpTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
  ssl: true,
  auth: {
    user: "clinicnode2022@gmail.com", // real email address
    pass: "vfuvxgwdfrvestvd", // app password for clinicnode2022@gmail.com email
  },
});

async function sendSMSFromMail(phoneNumber, message) {
  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: "webaj.info@gmail.com",
    // to: "PERSONAL EMAIL",
    subject: phoneNumber,
    text: message,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    console.log(response);
    if (error) {
      console.log(error);
    } else {
      console.log("send!");
    }
  });
}

// async function ftpUploadSMS(pathFile, fileName) {
//   const client = new ftp.Client();
//   client.ftp.verbose = true;
//   try {
//     await client.access({
//       host: FTPAccessData.host,
//       port: FTPAccessData.port,
//       user: FTPAccessData.user,
//       password: FTPAccessData.password,
//     });
//     await client.ensureDir("smsupload");
//     await client.uploadFrom(pathFile, fileName);
//     fs.unlink(path.join("server/sms/", fileName), (err) => {
//       if (err) throw err;
//     });
//   } catch (err) {
//     console.log(err);
//   }
//   client.close();
// }

module.exports = sendSMSFromMail;
