const express = require("express");
const router = express.Router();
const mongo = require("mongodb").MongoClient;
// var assert = require('assert');
const Schema = mongo.Schema;
// const url = 'mongodb://localhost:27017/management_mongodb';
// const url = 'mongodb://appprodu_appproduction_prod:CJr4eUqWg33tT97mxPFx@vps.app-production.eu:42526/management_mongodb'
const url = 'mongodb://78.47.206.131:27017/management_mongo?gssapiServiceName=mongodb';
const database_name = 'management_mongodb';

router.get("/", (req, res) => {
    res.send("Initialize mongodb!");
});

router.post('/insertConfiguration', function(req, res, next) {
    var item = {
        user_id: req.body.user_id,
        defaultLanguage: req.body.defaultLanguage,
        theme: req.body.theme,
        events: req.body.events,
        store_users: req.body.store_users
    };

    mongo.connect(url, function(err, db) {
        if(err) throw err;
        var dbo = db.db(database_name);
        dbo.collection('user_configuration').insertOne(item, function(err, result) {
            console.log('Item inserted!' + result);
        });
    })
});

router.post('/updateLanguage', function(req, res, next) {
    mongo.connect(url, function(err, db, res) {
        if(err) throw err;
        var dbo = db.db(database_name);
        dbo.collection('user_configuration').updateOne({user_id: req.body.user_id}, {$set : {language: req.body.language}}, function(err, res) {
            if(err) throw err;
        })
    });
    res.json({code: 201});
});

router.post('/updateTheme', function(req, res, next) {
    var item = {
        user_id: req.body.user_id,
        theme: req.body.theme
    };

    mongo.connect(url, function(err, db, res) {
        if(err) throw err;
        var dbo = db.db(database_name);
        dbo.collection('user_configuration').updateOne({user_id: item.user_id}, {$set : {theme: req.body.theme}}, function(err, res) {
            if(err) throw err;
        })
    });
    res.json({code: 201});
});

router.post('/setSelectedStore', function(req, res, next) {
    var item = {
        user_id: req.body.user_id,
        selectedStore: req.body.selectedStore
    };

    mongo.connect(url, function(err, db) {
        if(err) throw err;
        var dbo = db.db(database_name);
        dbo.collection('user_configuration').findOne({user_id: Number(req.body.user_id)}, function(err, rows) {
            if(err) throw err;
            console.log(rows);
            if(rows === null || rows.length === 0) {
                dbo.collection('user_configuration').updateOne({user_id: item.user_id}, {$push: {'selectedStore': req.body.selectedStore}}, function(err, res) {
                    if(err) throw err;
                });
            } else {
                dbo.collection('user_configuration').updateOne({user_id: req.body.user_id}, {$set : {'selectedStore.0': req.body.selectedStore}}, function(err, res) {
                    if(err) throw err;
                });
            }
        })
    });
    res.json({code: 201});
});

router.post('/setUsersFor', function(req, res, next) {
    var item = {
        key: req.body.key,
        value: req.body.value
    };
    console.log(req.body.user_id);
    mongo.connect(url, function(err, db) {
        if(err) throw err;
        var dbo = db.db(database_name);
        dbo.collection('user_configuration').findOne({usersFor: {$elemMatch: {key: item.key}}}, function(err, rows) {
            console.log(rows);
            if(err) throw err;
            if(rows === null || rows.length === 0) {
                dbo.collection('user_configuration').updateOne({user_id: Number(req.body.user_id)}, {$push: {'usersFor': item}}, function(err, res) {
                    if(err) throw err;
                });
            } else {
                dbo.collection('user_configuration').updateOne({usersFor: {$elemMatch: {key: item.key}}}, {$set : {'usersFor.$': item}}, function(err, res) {
                    if(err) throw err;
                });
            }
            res.json(201);
        })
    })
})

router.get('/getConfiguration/:id', function(req, res, next) {
    const id = req.params.id;

    mongo.connect(url, function(err, db) {
        if(err) throw err;
        var dbo = db.db(database_name);
        dbo.collection('user_configuration').findOne({user_id: Number(id)}, function(err, rows) {
            if(err) throw err;
            console.log(rows);
            console.log('prosao sam ovde!');
            if(rows !== null) {
                res.json(rows);
            } else {
                var item = {
                    user_id: Number(id),
                    language: 'english',
                    theme: 'Theme1',
                    selectedStore: [],
                    usersFor: []
                };
                dbo.collection('user_configuration').insertOne(item, function(err, result) {
                    console.log(result);
                    res.json(item);
                });
            }
        })
    })
})



module.exports = router;