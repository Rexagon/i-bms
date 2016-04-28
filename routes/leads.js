var express = require('express');
var app = require('../app');
var router = express.Router();

router.get('/leads', app.restrict, app.restrictPage, function(req, res) {
    var authData = req.session.authData;
    res.render('template', {
        authData : authData,
        title :    'Лиды',
        styles :   [],
        scripts :  [],
        page :     'leads',
        section :  'leads', 
    });
});

module.exports = router;
