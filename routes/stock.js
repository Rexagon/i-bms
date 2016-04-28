var express = require('express');
var app = require('../app');
var router = express.Router();

router.get('/stock', app.restrict, app.restrictPage, function(req, res) {
    var authData = req.session.authData;
    res.render('template', {
        authData : authData,
        title :    'Склад',
        styles :   [],
        scripts :  [],
        page :     'stock',
        section :  'stock', 
    });
});

module.exports = router;
