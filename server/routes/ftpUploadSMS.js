const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

var FTPAccessData = {
  host: "bci.dyndns.org",
  port: 21,
  user: "sms1",
  password: "wurschtises",
};

async function ftpUploadSMS(pathFile, fileName) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: FTPAccessData.host,
      port: FTPAccessData.port,
      user: FTPAccessData.user,
      password: FTPAccessData.password,
    });
    await client.ensureDir("smsupload");
    await client.uploadFrom(pathFile, fileName);
    fs.unlink(path.join("server/sms/", fileName), (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.log(err);
  }
  client.close();
}

module.exports = ftpUploadSMS;
