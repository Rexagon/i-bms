var express = require('express');
var router = express.Router();
var app = require('../app');
var fm = require('../firebase-manager');

// /AGENTS
router.get('/agents', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;


	fm.ref().child('projects').once('value', function(projectsSnapshot) {
		var projects = [];
		projectsSnapshot.forEach(function(data) {
			projects.push({ id : data.key(), name : data.val().name });
		});

		fm.ref().child('agents_groups').once('value', function(snapshot) {
			var groups = [];
			snapshot.forEach(function(data) {
				groups.push({ id : data.key(), name : data.val().name });
			});

			res.render('template', {
		    	authData : authData,
		    	title :    'Контрагенты',
		    	styles :   [
		    		'assets/global/plugins/datatables/datatables.min.css',
	          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
		    	],
		    	scripts :  [
		    		'assets/global/scripts/datatable.min.js',
	          'assets/global/plugins/datatables/datatables.min.js',
	          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
	          'scripts/agents.js'
		    	],
		    	page :    'agents',
					section : 'agents',
		    	groups : 	groups,
		    	projects :  projects,
		    });
		});
	});
});

router.post('/agents/get', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('agents_groups').once('value', function(groupSnapshot) {
		var groups = {};
		groupSnapshot.forEach(function(data) {
			groups[data.key()] = data.val().name;
		});

		fm.ref().child('projects').once('value', function(projectsSnapshot) {
			var projects = {};
			projectsSnapshot.forEach(function(data) {
				projects[data.key()] = data.val().name;
			});
			projects[''] = '';

			fm.ref().child('agents').orderByChild('name').once('value', function(snapshot) {
				var request = req.body;
				var agents = [];

				snapshot.forEach(function(data) {
					var agent = data.val();
					var found = false;
					var project = projects[request.agent_project];

					if (request.action == 'filter') {
						found = ((request.agent_type == '') && (request.agent_name == '') && (request.agent_phone == '') && (project == '') && (request.agent_group == '')) ||
								((request.agent_type != '') && (agent.type == request.agent_type)) ||
								((request.agent_name != '') && (agent.name.toLowerCase().search(request.agent_name.toLowerCase()) != -1)) ||
								((request.agent_phone != '') && (agent.phone.toLowerCase().search(request.agent_phone.toLowerCase()) != -1)) ||
								((request.agent_project != '') && (agent.project == request.agent_project)) ||
								((request.agent_group != '') && (agent.groups.indexOf(request.agent_group) != -1));
					} else {
						found = true;
					}

					if (found == true) {
						agents.push({
							id : agent.id,
							type : agent.type,
							name : agent.name,
							phone : agent.phone,
							project : agent.project,
							groups : agent.groups
						});
					}
				});

				var totalRecordsNum = parseInt(agents.length);
				var displayLength = parseInt(request.length);
				displayLength = displayLength < 0 ? totalRecordsNum : displayLength;
				var displayStart = parseInt(request.start);

				var records = {
					data : [],
					draw : parseInt(request.draw),
					recordsTotal : totalRecordsNum,
					recordsFiltered : totalRecordsNum
				};

				var displayEnd = displayStart + displayLength;
				displayEnd = displayEnd > totalRecordsNum ? totalRecordsNum : displayEnd;

				for (var i = displayStart; i < displayEnd; ++i) {
					var agent = agents[i];

					var recordGroups = '';
					for (id in agent.groups) {
						recordGroups += '<span class="label label-primary">' + groups[agent.groups[id]] + '</span> ';
					}

					var type = agent.type == 'customer' ? 'Частный клиент' : 'Компания';

					records.data.push([
						'<input type="checkbox" name="id[]" value="'+agent.id+'">',
						type,
						agent.name,
						agent.phone,
						projects[agent.project],
						recordGroups,
						'<a href="agents/edit?id='+agent.id+'" class="btn btn-sm green btn-outline">Изменить</a>'
					]);
				}

				res.send(records);
			});
		});
	});
});

// /AGENTS/EDIT
fm.ref().child('agents').on('child_added', function(childSnapshot, prevChildKey) {
  childSnapshot.ref().child('groups').orderByValue().equalTo('providers').once('value', function(snapshot) {
		if (snapshot.exists()) {
			childSnapshot.ref().child('provider').set('true');
		}
	});

	childSnapshot.ref().child('groups').orderByValue().equalTo('producers').once('value', function(snapshot) {
		if (snapshot.exists()) {
			childSnapshot.ref().child('producer').set('true');
		}
	});
});

fm.ref().child('agents').on('child_changed', function(childSnapshot, prevChildKey) {
	childSnapshot.ref().child('groups').orderByValue().equalTo('providers').once('value', function(snapshot) {
		if (snapshot.exists()) {
			childSnapshot.ref().child('provider').set('true');
		}
	});

	childSnapshot.ref().child('groups').orderByValue().equalTo('producers').once('value', function(snapshot) {
		if (snapshot.exists()) {
			childSnapshot.ref().child('producer').set('true');
		}
	});
});

router.get('/agents/edit', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;

	var title = 'Контрагент';

	var styles = [
		'assets/global/plugins/datatables/datatables.min.css',
		'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
		'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
		'assets/global/plugins/jquery-multi-select/css/multi-select.css',
		'assets/global/plugins/select2/css/select2.min.css',
		'assets/global/plugins/select2/css/select2-bootstrap.min.css',
		'assets/global/plugins/bootstrap-toastr/toastr.min.css'
	];

	var scripts = [
		'assets/global/scripts/datatable.min.js',
		'assets/global/plugins/datatables/datatables.min.js',
		'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
		'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
		'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
		'assets/global/plugins/select2/js/select2.full.min.js',
		'assets/global/plugins/bootstrap-toastr/toastr.min.js',
		'scripts/agents_edit.js'
	];

	if (req.query.id) {
		fm.ref().child('agents_groups').once('value', function(groupSnapshot) {
			var groups = [];
			groupSnapshot.forEach(function(data) {
				groups.push({ id : data.key(), name : data.val().name });
			});

			fm.ref().child('projects').once('value', function(projectSnapshot) {
				var projects = [];
				projectSnapshot.forEach(function(data) {
					projects.push({ id : data.key(), name : data.val().name });
				});

				fm.ref().child('agents/' + req.query.id).once('value', function(snapshot) {
					if (snapshot.exists()) {
						var agent = snapshot.val();

						var contacts = agent.contacts || [];
						var address = agent.address || [];
						var requisites = agent.requisites || [];
						var accounts = agent.accounts || [];

						delete agent.contacts;
						delete agent.address;
						delete agent.requisites;
						delete agent.accounts;

						res.render('template', {
					    	authData : authData,
					    	title :    title,
					    	styles :   styles,
					    	scripts :  scripts,
					    	page :     'agents_edit',
								section : 'agents',
					    	projects : 	projects,
					    	groups : 	groups,
					    	agent : 	agent,
					    	contacts :  contacts,
					    	address :   address,
					    	requisites :requisites,
					    	accounts :  accounts,
					    });
					} else {
						if (req.query.id == 'new') {
							var data = {
								id : 'new',
								name : '',

								type : 'customer',
								project : '',
								phone : '',
								email : '',
								website : '',
								groups : [],

								comment : ''
							};

							res.render('template', {
						    	authData : authData,
						    	title :    title,
						    	styles :   styles,
						    	scripts :  scripts,
						    	page :     'agents_edit',
									section : 'agents',
						    	projects : 	projects,
						    	groups : 	groups,
						    	agent : 	data,
						    	contacts :  [],
						    	address :   [],
						    	requisites :[],
						    	accounts :  []
						    });
						} else {
							res.redirect('/agents');
						}
					}
				});
			});
		});
	} else {
		res.redirect('/agents');
	}
});

router.post('/agents/edit', app.restrict, app.restrictPage, function(req, res) {
	var agent = req.body.general;
	if (req.body.contacts) {
		agent['contacts'] = req.body.contacts;
	}

	if (req.body.address) {
		agent['address'] = req.body.address;
	}

	if (req.body.requisites) {
		agent['requisites'] = req.body.requisites;
	}

	if (req.body.accounts) {
		agent['accounts'] = req.body.accounts;
	}
	if (agent.id == 'new') {
		var newAgent = fm.ref().child('agents').push();
		agent.id = newAgent.key();

		newAgent.set(agent, function(error) {
			var response = { text : 'Данные успешно сохранены', id : agent.id };
			res.send(response);
		});
	} else {
		fm.ref().child('agents/' + agent.id).set(agent, function(error) {
			var response = { text : 'Данные успешно сохранены' };
			res.send(response);
		});
	}
});

router.post('/agents/delete', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('agents/' + req.body.id).remove(function(error) {
		res.send('ok');
	});
});

module.exports = router;
