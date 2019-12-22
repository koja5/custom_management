const express = require("express");
const router = express.Router();
const mongo = require("mongodb").MongoClient;
// var assert = require('assert');
const Schema = mongo.Schema;
const url = 'mongodb://localhost:27017/management_mongodb';

router.get("/", (req, res) => {
    res.send("Initialize mongodb!");
});

router.post('/insertConfiguration', function(req, res, next) {
    var item = {
        user_id: req.body.user_id,
        theme: req.body.theme,
        events: req.body.events,
        store_users: req.body.store_users
    };

    mongo.connect(url, function(err, db) {
        if(err) throw err;
        var dbo = db.db("management_mongodb");
        dbo.collection('user_configuration').insertOne(item, function(err, result) {
            console.log('Item inserted!' + result);
        })
    })
});

router.get('/getConfigurationForUser/:user_id', function(req, res, next) {
    const user_id = req.params.user_id;

    mongo.connect(url, function(err, db) {
        if(err) throw err;
        const dbo = db.db("management_mongodb");
        dbo.collection('user_configuration').findOne({user_id: user_id}).toArray(function(err, result) {
            if(err) throw err;
            res.send(result);
            db.close();
        });

    })
})

module.exports = router;