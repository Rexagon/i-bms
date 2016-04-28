var express = require('express');
var app = require('../app');
var fm = require('../firebase-manager')
var router = express.Router();

router.get('/profile', app.restrict, function (req, res) {
	var authData = req.session.authData;
    res.render('template', {
    	authData : authData,
    	title : 'Профиль',
    	styles : [
    		'assets/pages/css/profile.min.css'
    	],
    	scripts : [
    		'scripts/profile.js'
    	],
    	page : 'profile',
			section:'profile', 
    });
});

router.post('/profile/change/info', app.restrict, function(req, res) {
	var authData = req.session.authData;

	fm.ref().child('users/' + authData.uid + '/info').update({
		name : req.body.name,
		surname : req.body.surname,
		phone : req.body.phone,
		position : req.body.position,
		about : req.body.about
	}, function(error) {
		authData.info.name = req.body.name;
		authData.info.surname = req.body.surname;
		authData.info.phone = req.body.phone;
		authData.info.position = req.body.position;
		authData.info.about = req.body.about;

		res.send('Информация успешно сохранена');
	});
});

router.post('/profile/change/password', app.restrict, function(req, res) {
	var ref = fm.ref().child('users/' + req.session.authData.uid + '/password');

	ref.once('value', function(data) {
		if (data.val() == req.body.current) {
			ref.set(req.body.new, function(error) {
				res.send({redirect : '/logout'});
			});
		} else {
			res.send('Неверный текущий пароль!');
		}
	});
});

module.exports = router;
