var Save = function() {
	var data = {
		id: $('#article-id').val()
	};

	var form = $('#form-article').serializeArray();
	for (var i = 0; i < form.length; ++i) {
		data[form[i].name] = form[i].value;
	}
	delete data._wysihtml5_mode;

	$.post('/wiki/edit', data, function(res) {
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
	      window.location.search = '?page=' + res.id;
	    }
	});
}

var Cancel = function() {
  if (confirm("Вы действительно хотите отменить изменения?") == true) {
		window.location.href = '/wiki';
	}
}

var Delete = function() {
  var id = $('#article-id').val();

	if (id != 'new' || id == '') {
		if (confirm("Вы действительно хотите удалить страницу?") == true) {
			$.post('/wiki/delete', {id : id}, function(res) {
				window.location.href = '/wiki';
			});
		}
	} else {
		window.location.href = '/wiki';
	}
}

$(document).ready(function() {
	$('.wysihtml5').wysihtml5({
		stylesheets : ["../assets/global/plugins/bootstrap-wysihtml5/wysiwyg-color.css"],
		useLineBreaks : true,
	});
});
