var images = {};

$('.multi-select').multiSelect();

var Save = function() {
	var form = $('#form-general').serializeArray();
	var data = {
		id: $('#group-id').val()
	};
	for (var i = 0; i < form.length; ++i) {
		data[form[i].name] = form[i].value;
	}

	form = $('#form-description').serializeArray();
	data[form[0].name] = form[0].value;
	data[form[2].name] = form[2].value;

	form = $('#form-properties').serializeArray();
	for (var i = 0; i < form.length; ++i) {
		data[form[i].name] = form[i].value;
	}

  $('.multi-select').map(function(i, el){
		data[el.name] = $(el).val();
	});

	if (data.id != 'new') {
		var descriptions = $('#fileupload').find('input[type="text"]');
		if (descriptions.length > 0) {
			for (var i = 0; i < descriptions.length; ++i) {
				images[descriptions[i].id].pos = i;
				images[descriptions[i].id].description = descriptions[i].value;
			}
			var defaultImage = $('input[type="radio"][name="isDefault"]')[0].value;
			images[defaultImage].isDefault = true;
			data.images = images;
		}

		if ($('#small-image').attr('src') != '') {
			smallImage.description = $('#small-description').val();
			data['imageSmall'] = smallImage;
		}
	}

	$.post('/goods/groups/edit', data, function(res) {
		toastr.options = {
			"closeButton": false,
			"debug": false,
			"positionClass": "toast-top-right",
			"onclick": null,
			"showDuration": "1000",
			"hideDuration": "1000",
			"timeOut": "3700",
			"extendedTimeOut": "1000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		}

		toastr['success']("Запись успешно обновлена в базе данных", "Сохранено");

		if (res.id) {
			window.location.search = '?id=' + res.id;
		}
	});
}

var Cancel = function() {
	if (confirm("Вы действительно хотите отменить изменения?") == true) {
		window.location.href = '/goods';
	}
}
var MoveRowUp = function(e, el) {
	e.preventDefault();
	var elem = $(el);
	var row = elem.closest('tr');
	row.prev().insertAfter(row);

	elem.prop("disabled", row.prev().length == 0);
	if (row.next().length != 0) {
		$($(row.next()[0]).find('.sort-desc')[0]).attr("disabled", row.next().next().length == 0);
		$($(row.next()[0]).find('.sort-asc')[0]).attr("disabled", false);
	}

	elem.next().prop("disabled", false);
}

var MoveRowDown = function(e, el) {
	e.preventDefault();
	var elem = $(el);
	var row = $(el).closest('tr');
	row.insertAfter(row.next());

	elem.prop("disabled", row.next().length == 0);
	if (row.prev().length != 0) {
		$($(row.prev()[0]).find('.sort-asc')[0]).attr("disabled", row.prev().prev().length == 0);
		$($(row.prev()[0]).find('.sort-desc')[0]).attr("disabled", false);
	}

	elem.prev().prop("disabled", false);
}

var DeleteSmallPhoto = function(e, el) {
	e.preventDefault();
	$.post('/goods/groups/photosmall/delete', {
		id: $('#group-id').val()
	}, function(res) {
		delete smallImage;
		$(el).css('display', 'none');
		$('#small-image-td').css('display', 'none');
		$('#small-description-td').css('display', 'none');
		$('#small-add-text').html('Добавить фото');
		$('#small-image').attr('src', '');
	});
}

var TemplateChange = function(el) {
	var properties = templates[el.value];
	var html = '';
	for (var i in properties) {
		var property = properties[i];
		html += '<div class="form-group"><label class="col-md-3 control-label">' + property.text + '</label><div class="col-md-9"><input type="' + property.type + '" class="form-control" name="' + el.value + '_' + property.name + '" placeholder="' + (property.placeholder ? property.placeholder : '') + '"></div></div>';
	}
	$('#properties').html(html);
}

var InitFileUploadForn = function() {
	$('#fileupload').fileupload({
		url: '/goods/groups/photos/upload',
		dataType: 'json',
		autoUpload: false,
		disableImageResize: false,
		maxFileSize: 5000000,
		acceptFileTypes: /(\.|\/)(jpg|png)$/i,
		formData: {
			id: $('#group-id').val()
		}
	}).bind('fileuploaddone', function(e, data) {
		data.result.files.forEach(function(file, key) {
			images[file.name.substr(0, file.name.length - 4)] = file;
		});
	});

	$('#fileupload-small').fileupload({
		url: '/goods/groups/photosmall/upload',
		dataType: 'json',
		autoUpload: false,
		disableImageResize: false,
		maxFileSize: 5000000,
		acceptFileTypes: /(\.|\/)(jpg|png)$/i,
		autoUpload: true,
		formData: {
			id: $('#group-id').val()
		}
	}).bind('fileuploaddone', function(e, data) {
		smallImage = data.result.files[0];
		$('#small-image').attr('src', smallImage.url);
		$('#small-image-td').css('display', '');
		$('#small-description').val('');
		$('#small-description-td').css('display', '');
		$('#small-delete-btn').css('display', '');
		$('#small-add-text').html('Изменить фото');
	});

	$('#fileupload').addClass('fileupload-processing');

	$.ajax({
		type: 'POST',
		url: '/goods/groups/photos/get?id=' + $('#group-id').val(),
		dataType: 'json',
		context: $('#fileupload')[0]
	}).always(function() {
		$(this).removeClass('fileupload-processing');
	}).done(function(result) {
		$(this).fileupload('option', 'done')
			.call(this, $.Event('done'), {
				result: result
			});

		result.files.forEach(function(file, key) {
			images[file.name.substr(0, file.name.length - 4)] = file;
		});
	});
}

jQuery(document).ready(function() {
	$('.wysihtml5').wysihtml5({
		"stylesheets": ["../../assets/global/plugins/bootstrap-wysihtml5/wysiwyg-color.css"]
	});

	if (!(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))) {
		$('#price-1').inputmask({
			'alias': 'numeric',
			'autoGroup': true,
			'digits': 2,
			'digitsOptional': false,
			'placeholder': '0'
		});

		$('#price-2').inputmask({
			'alias': 'numeric',
			'autoGroup': true,
			'digits': 2,
			'digitsOptional': false,
			'placeholder': '0'
		});
	}

	InitFileUploadForn();
});
