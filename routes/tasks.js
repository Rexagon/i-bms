var express = require('express');
var app = require('../app');
var router = express.Router();

router.get('/tasks', app.restrict, app.restrictPage, function(req, res) {
    var authData = req.session.authData;
    res.render('template', {
        authData : authData,
        title :    'Задачи',
        styles :   [],
        scripts :  [],
        page :     'tasks',
        section :  'tasks', 
    });
});

module.exports = router;
