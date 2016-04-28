var express = require('express');
var app = require('../app');
var router = express.Router();
var fm = require('../firebase-manager');
var multer = require('multer');
var shortid = require('shortid');
var fs = require('fs');
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './static/uploads/')
	},
	filename: function(req, file, cb) {
		cb(null, shortid.generate() + '.jpg') //Appending .jpg
	}
})
var upload = multer({
	storage: storage
});

router.get('/goods/groups', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('goods_groups').once('value', function(snapshot) {
		var tree = [];
		snapshot.forEach(function(data) {
			tree.push(data.val());
		});
		res.send(tree);
	});
});

router.post('/goods/groups/add', app.restrict, app.restrictPage, function(req, res) {
	var group = fm.ref().child('goods_groups/').push();
	group.set({
		id: group.key(),
		parent: req.body.parent,
		text: req.body.text,
		position: req.body.position,
		refs: 0
	}, function(error) {
		res.send({
			id: group.key()
		});
	});
});

router.post('/goods/groups/rename', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('goods_groups/' + req.body.id).update({
		text: req.body.text
	}, function(error) {
		res.send('');
	});
});

router.post('/goods/groups/delete', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('goods_groups').orderByChild('parent').equalTo(req.body.id).once('value', function(data) {
		if (data.exists()) {
			res.send({
				error: 'Нельзя удалить группу с вложениями'
			});
		} else {
			var ref = fm.ref().child('goods_groups/' + req.body.id);
			ref.remove(function(error) {
				fm.ref().child('goods').orderByChild('group').equalTo(ref.key()).once('value', function(snapshot) {
					snapshot.forEach(function(data) {
						fm.ref().child('goods/' + data.key() + '/group').set('root', function(error) {});
					});
					res.send('');
				});
			});
		}
	});
});

router.post('/goods/groups/move', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('goods_groups/' + req.body.id).update({
		position: req.body.position,
		parent: req.body.parent
	}, function(error) {
		res.send('');
	});
});

// GROUP EDIT
var CreateGroupsList = function(snapshotGroups) {
	var stack = [];
	stack.push(snapshotGroups.val().root);
	stack[0].level = 0;

	var groups = [];
	snapshotGroups.forEach(function(data) {
		groups.push(data.val());
	});

	var groupsList = [];

	while (stack.length > 0) {
		var current = stack.pop();

		for (i = groups.length - 1; i >= 0; --i) {
			if (current.id == groups[i].parent) {
				groups[i].level = current.level + 1;
				stack.push(groups[i]);
			}
		}

		if (current.level != 0) {
			groupsList.push({
				id: current.id,
				text: '&#8212'.repeat(current.level - 1) + ' ' + current.text
			});
		}
	}

	return groupsList;
}

router.get('/goods/groups/edit', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;
	if (req.query.id) {
		fm.ref().child('agents').orderByChild('producer').equalTo('true').once('value', function(producersSnapshot) {
			var producers = [];
			producersSnapshot.forEach(function(data) {
				producers.push({
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

				fm.ref().child('goods_groups').once('value', function(groupsSnapshot) {
					var groupsList = CreateGroupsList(groupsSnapshot);

					fm.ref().child('goods_properties').once('value', function(propertiesSnapshot) {
						var properties = propertiesSnapshot.val();

						fm.ref().child('directory/countries').once('value', function(countriesSnapshot) {
							var countries = [];
							countriesSnapshot.forEach(function(data) {
								countries.push({
									id: data.key(),
									name: data.val().name
								});
							});
							fm.ref().child('goods_groups/' + req.query.id).once('value', function(snapshot) {
								var title = 'Группа &nbsp &nbsp<a href="/goods" class="btn blue btn-outline">Назад</a>'
								var styles = [
									'assets/global/plugins/bootstrap-toastr/toastr.min.css',
									'assets/global/plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.css',
									'assets/global/plugins/fancybox/source/jquery.fancybox.css',
									'assets/global/plugins/jquery-file-upload/blueimp-gallery/blueimp-gallery.min.css',
									'assets/global/plugins/jquery-file-upload/css/jquery.fileupload.css',
									'assets/global/plugins/jquery-file-upload/css/jquery.fileupload-ui.css',
									'assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
									'assets/global/plugins/jquery-multi-select/css/multi-select.css',
									'assets/global/plugins/select2/css/select2.min.css',
									'assets/global/plugins/select2/css/select2-bootstrap.min.css'
								];
								var scripts = [
									'assets/global/plugins/bootstrap-toastr/toastr.min.js',
									'assets/global/plugins/bootstrap-wysihtml5/wysihtml5-0.3.0.js',
									'assets/global/plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.js',
									'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
									'assets/global/plugins/fancybox/source/jquery.fancybox.pack.js',
									'assets/global/plugins/jquery-file-upload/js/vendor/jquery.ui.widget.js',
									'assets/global/plugins/jquery-file-upload/js/vendor/tmpl.min.js',
									'assets/global/plugins/jquery-file-upload/js/vendor/load-image.min.js',
									'assets/global/plugins/jquery-file-upload/js/vendor/canvas-to-blob.min.js',
									'assets/global/plugins/jquery-file-upload/js/jquery.iframe-transport.js',
									'assets/global/plugins/jquery-file-upload/js/jquery.fileupload.js',
									'assets/global/plugins/jquery-file-upload/js/jquery.fileupload-process.js',
									'assets/global/plugins/jquery-file-upload/js/jquery.fileupload-image.js',
									'assets/global/plugins/jquery-file-upload/js/jquery.fileupload-validate.js',
									'assets/global/plugins/jquery-file-upload/js/jquery.fileupload-ui.js',
									'assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
									'assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',
									'scripts/goods_groups.js'
								];

								res.render('template', {
									authData: authData,
									title: title,
									styles: styles,
									scripts: scripts,
									page: 'goods_groups',
									section: 'goods',
									countries: countries,
									groups: groupsList,
									providers: providers,
									producers: producers,
									properties: properties,
									group: snapshot.val()
								});
							});
						});
					});
				});
			});
		});
	}
});

router.post('/goods/groups/edit', app.restrict, app.restrictPage, function(req, res) {
	var group = req.body;
	fm.ref().child('goods_groups/' + group.id).set(group, function(error) {
		var response = {
			text: 'Данные успешно сохранены'
		};
		res.send(response);
	});
});

router.post('/goods/groups/photos/upload', app.restrict, app.restrictPage, upload.array('files[]'), function(req, res) {
	if (req.body.id) {
		var response = {
			files: []
		};
		var dbRow = {};

		req.files.forEach(function(imageValues, key) {
			var name = imageValues.filename.substr(0, imageValues.filename.length - 4);

			var file = {
				name: imageValues.filename,
				originalName: imageValues.originalname,
				size: imageValues.size,
				url: '/uploads/' + imageValues.filename,
				description: '',
				isDefault: false,
				deleteType: 'POST',
				thumbnailUrl: '/uploads/' + imageValues.filename,
				deleteUrl: '/goods/groups/photos/delete?name=' + name + '&id=' + req.body.id
			};

			dbRow[name] = file;
			response.files.push(file);
		});

		fm.ref().child('goods_groups/' + req.body.id + '/images/').update(dbRow, function(error) {
			res.send(response);
		});
	} else {
		res.redirect('/goods/');
	}
});

router.post('/goods/groups/photosmall/upload', app.restrict, app.restrictPage, upload.single('file'), function(req, res) {
	if (req.body.id) {

		var name = req.file.filename.substr(0, req.file.filename.length - 4);

		fm.ref().child('goods_groups/' + req.body.id + '/imageSmall/').once('value', function(snapshot) {
			if (snapshot.exists()) {
				fs.unlink('./static/uploads/' + snapshot.val().name, function(error) {});
			}

			var response = {
				files: [{
					name: req.file.filename,
					originalName: req.file.originalname,
					size: req.file.size,
					url: '/uploads/' + req.file.filename,
					description: '',
					thumbnailUrl: '/uploads/' + req.file.filename,
				}]
			};

			fm.ref().child('/goods_groups/' + req.body.id + '/imageSmall/').set(response.files[0], function(error) {
				res.send(response);
			});
		});
	} else {
		res.redirect('/goods/');
	}
});

router.post('/goods/groups/photosmall/delete', app.restrict, app.restrictPage, function(req, res) {
	fm.ref().child('/goods_groups/' + req.body.id + '/imageSmall').once('value', function(snapshot) {
		if (snapshot.exists()) {
			fs.unlink('./static/uploads/' + snapshot.val().name, function(error) {});
		}

		fm.ref().child('/goods_groups/' + req.body.id + '/imageSmall').remove(function(error) {
			res.send('ok');
		});
	});
});

router.post('/goods/groups/photos/delete', app.restrict, app.restrictPage, function(req, res) {
	if (req.query.id && req.query.name) {
		fs.unlink('./static/uploads/' + req.query.name + '.jpg', function(error) {});
		fm.ref().child('goods_groups/' + req.query.id + '/images/' + req.query.name).remove(function(error) {
			var response = {
				files: [{}]
			};
			response.files[0][req.query.name + '.jpg'] = true;
			res.send(response);
		});
	}
});

router.post('/goods/groups/photos/get', app.restrict, app.restrictPage, function(req, res) {
	if (req.query.id) {
		var response = {
			files: []
		};

		fm.ref().child('goods_groups/' + req.query.id + '/images').orderByChild('pos').once('value', function(snapshot) {
			snapshot.forEach(function(image) {
				response.files.push(image.val());
			});

			res.send(response);
		});
	} else {
		res.send();
	}
});

module.exports = router;
