var express = require('express');
var router = express.Router();
var app = require('../app');
var fm = require('../firebase-manager');

router.get('/agents/groups', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;

	fm.ref().child('agents_groups').once('value', function(snapshot) {
		var groups = [];
		snapshot.forEach(function(data) {
			groups.push({ id : data.key(), name : data.val().name });
		});

		res.render('template', {
	    	authData : authData,
	    	title :    'Контрагенты <small>Группы</small> &nbsp &nbsp<a href="/agents" class="btn blue btn-outline">Назад</a>',
	    	styles :   [
	    		'assets/global/plugins/datatables/datatables.min.css',
          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css'
	    	],
	    	scripts :  [
	    		'assets/global/scripts/datatable.js',
          'assets/global/plugins/datatables/datatables.min.js',
          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
          'scripts/agents_groups.js'
	    	],
	    	page :    'agents_groups',
				section : 'agents',
	    	groups : 	groups
	    });
	});
});

router.post('/agents/groups/edit', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('agents_groups').orderByChild('name').equalTo(req.body.name).once('value', function(snapshot) {
		var result = { text : '', id : ''};
		if (snapshot.exists()) {
			result.text = 'Группа с таким именем уже существует!';
			res.send(result);
		} else {
			if (req.body.isNew == 'true') {
				var idRef = fm.ref().child('agents_groups').push({ name : req.body.name }, function(error) {
					result.id = idRef.key();
					res.send(result);
				});
			} else {
				fm.ref().child('agents_groups/' + req.body.id).set({ name : req.body.name }, function(error) {
					result.id = req.body.id;
					res.send(result);
				});
			}
		}
	});
});

router.post('/agents/groups/delete', app.restrict, app.restrictPage, function(req, res) {
	var group = fm.ref().child('agents_groups/' + req.body.id);
	group.child('permanent').once('value', function(data) {
		if (data.exists()) {
			res.send({ error: 'Эту группу нелья удалить!' })
		} else {
			group.remove(function(error) {
				res.send('Группа успешно удалена');
			});
		}
	});
});

module.exports = router;
