var express = require('express');
var app = require('../app');
var router = express.Router();
var fm = require('../firebase-manager.js');
require('../date-prettify.js');

router.get('/stock/acceptance', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;

	fm.ref().child('agents').orderByChild('ivm_legal_entity').equalTo('true').once('value', function(organizationsSnapshot) {
		var organizations = [];
		organizationsSnapshot.forEach(function(data) {
			organizations.push({
				id: data.key(),
				name: data.val().name
			});
		});

		fm.ref().child('agents').orderByChild('provider').equalTo('true').once('value', function(providersSnapshot) {
			var providers = [];
			providersSnapshot.forEach(function(data) {
				providers.push({
					id: data.key(),
					name: data.val().name
				});
			});

			fm.ref().child('projects').once('value', function(projectsSnapshot) {
				var projects = [];
				projectsSnapshot.forEach(function(data) {
					projects.push({
						id: data.key(),
						name: data.val().name
					});
				});

				fm.ref().child('directory/warehouses').once('value', function(warehousesSnapshot) {
					var warehouses = [];
					warehousesSnapshot.forEach(function(data) {
						warehouses.push({
							id: data.key(),
							name: data.val().name
						});
					});

					var acceptance = {
						date: (new Date()).format('dd-mm-yyyy'),
						organization: '',
						provider: '',
						project: '',
						warehouse: ''
					};

					res.render('template', {
						authData: authData,
						title: 'Склад',
						styles: [
							'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
						],
						scripts: [
							'assets/global/plugins/moment.min.js',
							'assets/global/plugins/bootstrap-daterangepicker/daterangepicker.min.js',
							'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
							'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
							'assets/pages/scripts/components-date-time-pickers.min.js'
						],
						page: 'stock_acceptance',
						section: 'stock',
						acceptance: acceptance,
						organizations: organizations,
						providers: providers,
						projects: projects,
						warehouses: warehouses
					});
				});
			});
		});
	});
});

module.exports = router;
