var express = require('express');
var app = require('../app');
var router = express.Router();

router.get('/stock/balances', app.restrict, app.restrictPage, function(req, res) {
    var authData = req.session.authData;
    res.render('template', {
        authData : authData,
        title :    'Склад',
        styles :   [],
        scripts :  [],
        page :     'stock_balances',
        section :  'stock',
    });
});

module.exports = router;
