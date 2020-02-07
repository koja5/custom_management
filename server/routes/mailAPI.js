var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
var sha1 = require('sha1');

var smtpTransport = nodemailer.createTransport({
    host: '78.47.206.131',
    port: 25,
    secure: false,
    // requireTLS: true,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'info@app-production.eu',
        pass: 'jBa9$6v7'
    }
    /*host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'kojaaa95@gmail.com',
        pass: 'vrbovac12345'
    }*/
});

//slanje maila pri registraciji
router.post('/send', function(req, res) {
    console.log(req.body.email);
    let broj = sha1(req.body.email);
    let mail = "Thank you for registering. We require that you validate your registration to ensure that the email address you entered was correct. This protects against unwanted spam and malicious abuse. Your username is: " + req.body.shortname;
    mail += ".\nTo activate your account, simply click on the following link:\n";
    //mail+="http://147.91.204.116:2030/api/korisnik/verifikacija/" + broj + "\n";
    // mail += "http://app-production.eu:8080/api/korisnik/verifikacija/" + broj + "\n";
    mail += "http://localhost:3000/api/korisnik/verifikacija/" + broj + "\n";
    mail += "Best regards,\nTuina Praxis!"

    var mailOptions = {
        from: 'info@app-production.eu',
        to: req.body.email,
        subject: "Confirm registration",
        text: mail
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
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

router.post('/forgotmail', function(req, res) {
    let broj = sha1(req.body.email);
    let mail = "Dear \nIf you submitted your password change request at app-production.eu, ";
    mail += "you can do so by clicking the following link. \ n If you did not submit this request, please ignore this message.\n";
    // mail += "http://app-production.eu:8080/changePassword/" + broj + "\n";
    mail += "http://localhost:4200/changePassword/" + broj + "\n";
    mail += "Regards \nTuina Praxis!"

    var mailOptions = {
        from: 'info@app-production.eu',
        to: req.body.email,
        subject: "Reset password",
        text: mail
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
            res.end(error);
        } else {
            console.log("Message sent: " + response);
            res.end("sent");
        }
    });
});

router.post('/askQuestion', function(req, res) {

    let ime = req.body.ime;
    let naslov = req.body.naslov;
    let email = req.body.email;
    let poruka = req.body.poruka;
    let mail = "Posiljalac: \n" + ime + "\n" + email + "\n\n" + poruka;

    console.log(mail);
    var mailOptions = {
        to: "info@app-production.eu",
        subject: naslov,
        text: mail
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
            res.send({ message: "error" });
        } else {
            console.log("Message sent: " + response.message);
            res.send({ message: "sent" });
        }
    });
});



module.exports = router;