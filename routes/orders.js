var express = require('express');
var app = require('../app');
var router = express.Router();

router.get('/orders', app.restrict, app.restrictPage, function(req, res) {
    var authData = req.session.authData;
    res.render('template', {
        authData : authData,
        title :    'Заказы',
        styles :   [],
        scripts :  [],
        page :     'orders',
        section :  'orders', 
    });
});

module.exports = router;
