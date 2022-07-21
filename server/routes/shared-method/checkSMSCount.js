require("dotenv").config();
const mysql = require("mysql");
const logger = require("../logger");

var link = process.env.link_api;
/*
var connection = mysql.createPool({
    host: "185.178.193.141",
    user: "appproduction.",
    password: "jBa9$6v7",
    database: "management"
});
 */
var connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

function checkSMSCount(superadmin, needCount) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    conn.query(
      "select * from sms_count where superadmin = ?",
      [superadmin],
      function (err, rows) {
        if (rows && rows.length > 0) {
          console.log(rows);
          if (rows[0].count > needCount) {
            const updateCount = rows[0].count - needCount;
            conn.query(
              "update sms_count set count = ? where superadmin = ?",
              [updateCount, superadmin],
              function (err, rows) {
                if (!err) {
                  return true;
                } else {
                  return false;
                }
              }
            );
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    );
  });
}

module.exports = checkSMSCount;
