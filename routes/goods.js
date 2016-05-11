var express = require('express');
var app = require('../app');
var router = express.Router();
var fm = require('../firebase-manager');
var fs = require('fs');
var getSize = require('get-folder-size');
var shortid = require('shortid');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './static/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + '.jpg') //Appending .jpg
  }
})
var upload = multer({storage: storage});

var url = process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:1337/' : 'http://bms.ivamar.pro/';

router.get('/goods', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;
	fm.ref().child('goods').once('value', function(snapshot) {
		var goods = [];
		snapshot.forEach(function(data) {
			goods.push({id: data.key(), name: data.val().name });
		});

		res.render('template', {
	  	authData : authData,
	  	title :    'Товары',
	  	styles :   [
				'assets/global/plugins/jstree/dist/themes/default/style.min.css',
        'assets/global/plugins/datatables/datatables.min.css',
        'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
			],
	  	scripts :  [
				'assets/global/plugins/jstree/dist/jstree.min.js',
        'assets/global/scripts/datatable.min.js',
        'assets/global/plugins/datatables/datatables.min.js',
        'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
				'scripts/goods.js'
			],
	  	page :     'goods',
      section :  'goods',
			goods : 	 goods,
      currentGroup: req.query.cg
	  });
	});
});

var CreateTableData = function(request, goods) {
  var totalRecordsNum = parseInt(goods.length);
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
    var product = goods[i];

    var image = '';
    if (product.imageSmallUrl) {
      image = '<img src="'+product.imageSmallUrl+'" width="120px">';
    }

    var currensies = {
      rub: ' ₽',
      usd: '$',
      eur: '€'
    }

    var sPrice = product.selling_price_currency=='rub'? product.selling_price+currensies.rub : currensies[product.selling_price_currency]+product.selling_price;
    var pPrice = product.purchase_price_currency=='rub'? product.purchase_price+currensies.rub : currensies[product.purchase_price_currency]+product.purchase_price;

    records.data.push([
      '<input type="checkbox" name="id[]" value="'+product.id+'">',
      image,
      product.name,
      product.volume,
      sPrice,
      pPrice,
      product.instock=='true'?'Есть':'Нет',
      '<a href="goods/edit?id='+product.id+'" class="btn btn-sm green btn-outline">Изменить</a>'
    ]);
  }

  return records;
}

router.post('/goods/get', app.restrict, app.restrictPage, function(req, res) {
  if (!req.body.group) {
    req.body.group = 'root';
  }

  var request = req.body;

  if (request.action == 'filter') {
    fm.ref().child('goods/').orderByChild('name').once('value', function(snapshot) {
      var goods = [];

      snapshot.forEach(function(data) {
        var product = data.val();
        var found = false;

        found = ((request.product_name == '') && (request.product_volume == '') && (request.product_selling_price == '') && (request.product_purchase_price == '') && (request.product_instock == 'false')) ||
          ((request.product_name != '') && (product.name.toLowerCase().search(request.product_name.toLowerCase()) != -1)) ||
          ((request.product_volume != '') && (product.volume != '') && (product.volume == request.product_volume)) ||
          ((request.product_selling_price != '') && (product.selling_price != '') && (product.selling_price == request.product_selling_price)) ||
          ((request.product_purchase_price != '') && (product.purchase_price != '') && (product.purchase_price == request.product_purchase_price)) ||
          ((request.product_instock == 'true') && (product.instock == 'true'));

        if (found == true) {
          goods.push({
            id : product.id,
            name : product.name,
            volume : product.volume,
            selling_price : product.selling_price,
            purchase_price : product.purchase_price,
            selling_price_currency : product.selling_price_currency,
            purchase_price_currency : product.purchase_price_currency,
            instock : product.instock,
            imageSmallUrl : product.imageSmall?product.imageSmall.url:undefined,
          });
        }
      });

      res.send(CreateTableData(request, goods));
    });
  } else {
    fm.ref().child('goods/').orderByChild('group').equalTo(req.body.group).once('value', function(snapshot) {
      var goods = [];

      snapshot.forEach(function(data) {
        var product = data.val();

        goods.push({
          id : product.id,
          name : product.name,
          volume : product.volume,
          selling_price : product.selling_price,
          purchase_price : product.purchase_price,
          selling_price_currency : product.selling_price_currency,
          purchase_price_currency : product.purchase_price_currency,
          instock : product.instock,
          imageSmallUrl : product.imageSmall?product.imageSmall.url:undefined,
        });
      });

      res.send(CreateTableData(request, goods));
    });
  }
});

//GOODS EDIT
var CreateGroupsList = function(snapshotGroups) {
	var stack = [];
	stack.push(snapshotGroups.val().root);
	stack[0].level = 0;

	var groups = [];
	snapshotGroups.forEach(function(data) {
		groups.push(data.val());
	});

	var groupsList = [];

	while(stack.length > 0) {
		var current = stack.pop();

		for (i = groups.length-1; i >= 0; --i) {
			if (current.id == groups[i].parent) {
				groups[i].level = current.level + 1;
				stack.push(groups[i]);
			}
		}

		if (current.level != 0) {
			groupsList.push({id: current.id, text: '&#8212'.repeat(current.level-1) +' '+current.text});
		}
	}

	return groupsList;
}

router.get('/goods/edit', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;
	if (req.query.id) {
		fm.ref().child('agents').orderByChild('producer').equalTo('true').once('value', function(producersSnapshot) {
			var producers = [];
			producersSnapshot.forEach(function(data) {
				producers.push({id: data.key(), name: data.val().name});
			});

			fm.ref().child('agents').orderByChild('provider').equalTo('true').once('value', function(providersSnapshot) {
				var providers = [];
				providersSnapshot.forEach(function(data) {
					providers.push({id: data.key(), name: data.val().name});
				});

				fm.ref().child('goods_groups').once('value', function(groupsSnapshot) {
					var groupsList = CreateGroupsList(groupsSnapshot);

          fm.ref().child('goods_properties').once('value', function(propertiesSnapshot) {
            var properties = propertiesSnapshot.val();

  					fm.ref().child('directory/countries').once('value', function(countriesSnapshot) {
  						var countries = [];
  						countriesSnapshot.forEach(function(data) {
  							countries.push({id: data.key(), name: data.val().name});
  						});

  						var title = 'Товар'
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
  						var scripts= [
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
  							'scripts/goods_edit.js'
  						];

  						fm.ref().child('goods/'+req.query.id).once('value', function(snapshot) {
  							if (snapshot.exists() || req.query.id == 'new') {
  								var data = snapshot.exists() ? snapshot.val() : {id:'new', type:'product'};
  								data.photos = [];

                  var groups = groupsSnapshot.val();
                  var group = groups[req.query.group];
                  if (!group) group = groups[data.group];

  								res.render('template', {
  						    	authData : authData,
  						    	title :    title,
  						    	styles :   styles,
  						    	scripts :  scripts,
  						    	page :     'goods_edit',
                    section :  'goods',
  									product: 	 data,
  									countries: countries,
  									groups :   groupsList,
  									providers: providers,
  									producers: producers,
                    properties:properties,
                    group :    group
  						    });
  							} else {
  								res.redirect('/goods');
  							}
  						});
  					});
          });
				});
			});
		});
	} else {
		res.redirect('/goods');
	}
});

router.post('/goods/edit', app.restrict, app.restrictPage, function(req, res) {
	var product = req.body;
	if (product.id == 'new') {
		var newProduct = fm.ref().child('goods').push();
		product.id = newProduct.key();

		newProduct.set(product, function(error) {
			var response = { text : 'Данные успешно сохранены', id : product.id };
			res.send(response);
		});
	} else {
		fm.ref().child('goods/' + product.id).set(product, function(error) {
			var response = { text : 'Данные успешно сохранены' };
			res.send(response);
		});
	}
});

router.post('/goods/delete', app.restrict, app.restrictPage, function(req, res) {
  fm.ref().child('goods/'+req.body.id).once('value', function(snapshot) {
    var good = snapshot.val();
    var images = good.images;
    var imageSmall = good.imageSmall;

    if (images) {
      for (var key in images) {
        fs.unlink('./static/uploads/'+images[key].name, function(error) { });
      };
    }

    if (imageSmall) {
      fs.unlink('./static/uploads/'+imageSmall.name, function(error) { });
    }

  	fm.ref().child('goods/' + req.body.id).remove(function(error) {
  		res.send('ok');
  	});
  });
});

router.post('/goods/photos/upload', app.restrict, app.restrictPage, upload.array('files[]'), function(req, res) {
  if (req.body.id && req.body.id != 'new') {
    var response = {files: []};
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
        deleteUrl: '/goods/photos/delete?name=' + name + '&id=' + req.body.id
      };

      dbRow[name] = file;
      response.files.push(file);
    });

    fm.ref().child('goods/'+req.body.id+'/images/').update(dbRow, function(error) {
      res.send(response);
    });
  } else {
    res.send('Загрузка фотографий возможна только после сохранения товара!');
  }
});

router.post('/goods/photosmall/upload', app.restrict, app.restrictPage, upload.single('file'), function(req, res) {
  if (req.body.id && req.body.id != 'new') {

    var name = req.file.filename.substr(0, req.file.filename.length - 4);

    fm.ref().child('goods/' + req.body.id + '/imageSmall/').once('value', function(snapshot) {
      if (snapshot.exists()) {
        fs.unlink('./static/uploads/'+snapshot.val().name, function(error) {});
      }

      var response = {files: [{
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: '/uploads/' + req.file.filename,
        description: '',
        thumbnailUrl: '/uploads/' + req.file.filename,
      }]};

      fm.ref().child('/goods/'+req.body.id+'/imageSmall/').set(response.files[0], function(error) {
        res.send(response);
      });
    });
  } else {
    res.send('Загрузка фотографий возможна только после сохранения товара!');
  }
});

router.post('/goods/photosmall/delete', app.restrict, app.restrictPage, function(req, res) {
  fm.ref().child('/goods/'+req.body.id+'/imageSmall').once('value', function(snapshot) {
    if (snapshot.exists()) {
      fs.unlink('./static/uploads/'+snapshot.val().name, function(error) {});
    }

    fm.ref().child('/goods/'+req.body.id+'/imageSmall').remove(function(error) {
      res.send('ok');
    });
  });
});

router.post('/goods/photos/delete', app.restrict, app.restrictPage, function(req, res) {
  if (req.query.id && req.query.id != 'new' && req.query.name) {
    fs.unlink('./static/uploads/'+req.query.name+'.jpg', function(error) { });
    fm.ref().child('goods/' + req.query.id + '/images/' + req.query.name).remove(function(error) {
      var response = { files: [{}] };
      response.files[0][req.query.name+'.jpg'] = true;
      res.send(response);
    });
  }
});

router.post('/goods/photos/get', app.restrict, app.restrictPage, function(req, res) {
  if (req.query.id && req.query.id != 'new') {
    var response = {files: []};

    fm.ref().child('goods/'+req.query.id+'/images').orderByChild('pos').once('value', function(snapshot) {
      snapshot.forEach(function(image) {
        response.files.push(image.val());
      });

      res.send(response);
    });
  } else {
    res.send();
  }
});

router.get('/admin/uploads/clear', app.restrict, app.restrictPage, function(req, res) {
  try { var files = fs.readdirSync('./static/uploads'); }
  catch(e) { return; }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = './static/uploads/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
    }
  }

  res.send('Содержимое папки uploads удалено!');
});

router.get('/admin/uploads/getsize', app.restrict, app.restrictPage, function(req, res) {
  getSize('./static/uploads', function(err, size) {
    if (err) {
      res.send(err);
    } else {
      res.send((size / 1024 / 1024).toFixed(2) + ' Mb');
    }
  });
});

module.exports = router;
