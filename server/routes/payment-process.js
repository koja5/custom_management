require("dotenv").config();
const express = require("express");
const app = express();
var router = express.Router();
var request = require("request");
// This is your test secret API key.
const stripe = require("stripe")(
  "sk_test_51LhYhHL4uVudLiXAsXYCGWFY7RhraCcUwR9wbfV2xoL04pccSeLCLkbZvbPsxhivnRp9RJmu61YGFinNd7lKzOJz00r5f2ldt5"
);

const calculateOrderAmount = (items) => {
  return 1500;
};

router.post("/create-payment", (req, res, next) => {
  stripe.charges.create(
    {
      amount: req.body.price * 100,
      currency: "EUR",
      description:
        "name: " +
        req.body.name +
        ", email: " +
        req.body.email +
        ", phone: " +
        req.body.phone,
      source: req.body.token.id,
    },
    (err, charge) => {
      if (err) {
        console.log(err);
        next(err);
      }
      var options = {
        url: process.env.link_api + "updateLicence",
        method: "POST",
        body: req.body,
        json: true,
      };
      request(options, function (error, response, body) {
        res.json(response.body);
      });
    }
  );
});

router.post("/buy-sms", (req, res, next) => {
  stripe.charges.create(
    {
      amount: req.body.price * 100,
      currency: "EUR",
      description:
        "Buy SMS: " +
        req.body.smsCount +
        ", SUPERADMIN: " +
        req.body.superadminId,
      source: req.body.token.id,
    },
    (err, charge) => {
      if (err) {
        console.log(err);
        next(err);
      }
      var options = {
        url: process.env.link_api + "updateSmsCountForSuperadmin",
        method: "POST",
        body: req.body,
        json: true,
      };
      request(options, function (error, response, body) {});
      res.json({ success: true, status: "Payment successfull!" });
    }
  );
});

router.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/checkout", async (req, res) => {
  try {
    console.log(req.body);
    token = req.body.token;
    const customer = stripe.customers
      .create({
        email: "kojaaa95@gmail.com",
        source: token.id,
      })
      .then((customer) => {
        console.log(customer);
        return stripe.charges.create({
          amount: 1000,
          description: "Test Purchase using express and Node",
          currency: "USD",
          customer: customer.id,
        });
      })
      .then((charge) => {
        console.log(charge);
        res.json({
          data: "success",
        });
      })
      .catch((err) => {
        res.json({
          data: "failure",
        });
      });
    return true;
  } catch (error) {
    return false;
  }
});

module.exports = router;
