var express = require('express');
var app = require('../app');
var router = express.Router();

router.get('/', app.restrict, function(req, res) {
	var authData = req.session.authData;
    res.render('template', {
    	authData : authData,
    	title :    'Главная',
    	styles :   [],
    	scripts :  [],
    	page :     'index',
			section :  'index', 
    });
});

router.get('/logout', app.restrict, function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
