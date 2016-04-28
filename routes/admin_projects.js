var express = require('express');
var router = express.Router();
var app = require('../app');
var fm = require('../firebase-manager');

router.get('/admin/projects', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;

	fm.ref().child('projects').once('value', function(snapshot) {
		var projects = [];
		snapshot.forEach(function(data) {
			projects.push({ id : data.key(), name : data.val().name });
		});

		res.render('template', {
	    	authData : authData,
	    	title :    'Проекты',
	    	styles :   [
	    		'assets/global/plugins/datatables/datatables.min.css',
          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css'
	    	],
	    	scripts :  [
	    		'assets/global/scripts/datatable.js',
          'assets/global/plugins/datatables/datatables.min.js',
          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
	    		'scripts/admin_projects.js'
	    	],
	    	page :     'admin_projects',
				section :  'admin_projects',
	    	projects : 	projects
	    });
	});
});

router.post('/admin/projects/edit', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('projects').orderByChild('name').equalTo(req.body.name).once('value', function(snapshot) {
		var result = { text : '', id : ''};
		if (snapshot.exists()) {
			result.text = 'Проект с таким именем уже существует!';
			res.send(result);
		} else {
			if (req.body.isNew == 'true') {
				var idRef = fm.ref().child('projects').push({ name : req.body.name }, function(error) {
					result.id = idRef.key();
					res.send(result);
				});
			} else {
				fm.ref().child('projects/' + req.body.id).set({ name : req.body.name }, function(error) {
					result.id = req.body.id;
					res.send(result);
				});
			}
		}
	});
});

router.post('/admin/projects/delete', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('projects/' + req.body.id).remove(function(error) {
		res.send('Проект успешно удалён');
	});
});

module.exports = router;
