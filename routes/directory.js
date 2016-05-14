var express = require('express');
var app = require('../app');
var router = express.Router();
var fm = require('../firebase-manager');

router.get('/directory', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;

	fm.ref().child('directory/app_area').once('value', function(snapshotAppareas) {
		var appAreas = [];
		snapshotAppareas.forEach(function(data) {
			appAreas.push({
				id: data.key(),
				name: data.val().name
			});
		});

		fm.ref().child('directory/countries').once('value', function(snapshotCountries) {
			var countries = [];
			snapshotCountries.forEach(function(data) {
				countries.push({
					id: data.key(),
					name: data.val().name
				});
			});

			fm.ref().child('directory/warehouses').once('value', function(snapshotWarehouses) {
				var warehouses = [];
				snapshotWarehouses.forEach(function(data) {
					warehouses.push({
						id: data.key(),
						name: data.val().name
					});
				});

				res.render('template', {
					authData: authData,
					title: 'Справочник',
					styles: [
						'assets/global/plugins/datatables/datatables.min.css',
						'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css'
					],
					scripts: [
						'assets/global/scripts/datatable.js',
						'assets/global/plugins/datatables/datatables.min.js',
						'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
						'scripts/directory.js'
					],
					page: 'directory',
					section: 'directory',
					countries: countries,
					appAreas: appAreas,
					warehouses: warehouses
				});
			});
		});
	});
});

//COUNTRIES
router.post('/directory/countries/edit', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('directory/countries').orderByChild('name').equalTo(req.body.name).once('value', function(snapshot) {
		var result = {
			text: '',
			id: ''
		};
		if (snapshot.exists()) {
			result.text = 'Страна с таким именем уже существует!';
			res.send(result);
		} else {
			if (req.body.isNew == 'true') {
				var idRef = fm.ref().child('directory/countries').push({
					name: req.body.name
				}, function(error) {
					result.id = idRef.key();
					res.send(result);
				});
			} else {
				fm.ref().child('directory/countries/' + req.body.id).set({
					name: req.body.name
				}, function(error) {
					result.id = req.body.id;
					res.send(result);
				});
			}
		}
	});
});

router.post('/directory/countries/delete', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('directory/countries/' + req.body.id).remove(function(error) {
		res.send('Страна успешно удалена');
	});
});

//WAREHOUSES
router.post('/directory/warehouses/edit', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('directory/warehouses').orderByChild('name').equalTo(req.body.name).once('value', function(snapshot) {
		var result = {
			text: '',
			id: ''
		};
		if (snapshot.exists()) {
			result.text = 'Склад с таким именем уже существует!';
			res.send(result);
		} else {
			if (req.body.isNew == 'true') {
				var idRef = fm.ref().child('directory/warehouses').push({
					name: req.body.name
				}, function(error) {
					result.id = idRef.key();
					res.send(result);
				});
			} else {
				fm.ref().child('directory/warehouses/' + req.body.id).set({
					name: req.body.name
				}, function(error) {
					result.id = req.body.id;
					res.send(result);
				});
			}
		}
	});
});

router.post('/directory/warehouses/delete', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('directory/warehouses/' + req.body.id).remove(function(error) {
		res.send('Склад успешно удален');
	});
});

//APPLICATION AREA
router.post('/directory/app_area/edit', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('directory/app_area').orderByChild('name').equalTo(req.body.name).once('value', function(snapshot) {
		var result = {
			text: '',
			id: ''
		};
		if (snapshot.exists()) {
			result.text = 'Запись с таким именем уже существует!';
			res.send(result);
		} else {
			if (req.body.isNew == 'true') {
				var idRef = fm.ref().child('directory/app_area').push({
					name: req.body.name
				}, function(error) {
					result.id = idRef.key();
					fm.ref().child('goods_properties/paint_template/7_apparea/options/'+result.id).set({text: req.body.name, value: result.id}, function(error) {
						res.send(result);
					});
				});
			} else {
				fm.ref().child('directory/app_area/' + req.body.id).set({
					name: req.body.name
				}, function(error) {
					result.id = req.body.id;
					fm.ref().child('goods_properties/paint_template/7_apparea/options/'+result.id).set({text: req.body.name, value: result.id}, function(error) {
						res.send(result);
					});
				});
			}
		}
	});
});

router.post('/directory/app_area/delete', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('directory/app_area/' + req.body.id).remove(function(error) {
		fm.ref().child('goods_properties/paint_template/7_apparea/options/' + req.body.id).remove(function(error2) {
			res.send('Запись успешно удалена');
		});
	});
});

module.exports = router;
