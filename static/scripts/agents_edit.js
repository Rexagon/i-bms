$('#groups').multiSelect();

var GetGeneralInfo = function() {
	var form = $('#general').serializeArray();

	var result = {
		id : $('#agent-id').val(),
		name : $('#agent-name').val(),
		type : $('input[name="agent-type"]:checked').val(),
	};

	for (var i = 0; i < form.length; ++i) {
		result[form[i].name] = form[i].value;
	}

	var groups = $('#groups').val();
	result['groups'] = groups;
	return result;
}

var GetContactsInfo = function() {
	var forms = $('.contact-form');
	var result = [];

	for (var i = 0; i < forms.length; ++i) {
		var form = $(forms[i]).serializeArray();
		var contact = {};

		for (var j = 0; j < form.length; ++j) {
			contact[form[j].name] = form[j].value;
		}

		result.push(contact);
	}

	return result;
}

var GetAddressInfo = function() {
	var forms = $('.address-form');
	var result = [];

	for (var i = 0; i < forms.length; ++i) {
		var form = $(forms[i]).serializeArray();
		var address = {};

		for (var j = 0; j < form.length; ++j) {
			address[form[j].name] = form[j].value;
		}
		address.default = "false";
		result.push(address);
	}

	if (forms.length > 0) {
		result[parseInt($('input[name="address-default"]:checked').val()) || 0]["default"] = "true";
	}

	return result;
}

var GetRequisitesInfo = function() {
	var forms = $('.requisites-form');
	var result = [];

	for (var i = 0; i < forms.length; ++i) {
		var form = $(forms[i]).serializeArray();
		var requisites = {};

		for (var j = 0; j < form.length; ++j) {
			requisites[form[j].name] = form[j].value;
		}
		requisites.default = "false";
		result.push(requisites);
	}

	if (forms.length > 0) {
		result[parseInt($('input[name="requisites-default"]:checked').val()) || 0]["default"] = "true";
	}

	return result;
}

var GetAccountsInfo = function() {
	var forms = $('.accounts-form');
	var result = [];

	for (var i = 0; i < forms.length; ++i) {
		var form = $(forms[i]).serializeArray();
		var accounts = {};

		for (var j = 0; j < form.length; ++j) {
			accounts[form[j].name] = form[j].value;
		}
		accounts.default = "false";
		result.push(accounts);
	}

	if (forms.length > 0) {
		result[parseInt($('input[name="accounts-default"]:checked').val()) || 0]["default"] = "true";
	}

	return result;
}

var AddAccount = function(rid) {
	var accounts = $('#accounts-'+rid);
	var id = $('.accounts-form').length;
	var html = '<div class="portlet box grey-silver" id="account-'+id+'"><div class="portlet-title"><div class="caption"><i class="fa fa-credit-card"></i><span class="caption-subject bold uppercase"> Расчётный счёт</span></div><div class="tools"><a href="javascript:;" class="remove" data-original-title="" title="" onclick="DeleteAccount(event)"></a></div></div><div class="portlet-body"><form class="form-horizontal accounts-form" role="form"><div class="form-body"><input type="hidden" name="rid" value="'+rid+'"><div class="form-group"><label class="col-md-3 control-label">Номер счёта</label><div class="col-md-9"><input type="text" class="form-control" name="number" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">БИК</label><div class="col-md-9"><input type="text" class="form-control" name="bik" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Банк</label><div class="col-md-9"><input type="text" class="form-control" name="bank" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Адрес банка</label><div class="col-md-9"><input type="text" class="form-control" name="bank_address" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Корр. счёт</label><div class="col-md-9"><input type="text" class="form-control" name="correspondent_accout" placeholder="..." value=""></div></div></div></form><div class="row"><div class="col-md-9 col-md-offset-3"><label class="radio-inline"><input type="radio" name="accounts-default" value="'+id+'"/> Счёт по умолчанию<label class="radio-inline"></div></div></div></div>';
	accounts.append(html);
	$('input[name="accounts-default"][value='+id+']').prop("checked", true);
}

var DeleteAccount = function(e) {
	if (confirm("Вы действительно хотите удалить этот счёт?") == false) {
		e.stopPropagation();
	}
}

var DeleteRequisites = function(e) {
	if (confirm("Вы действительно хотите удалить этоти реквизиты?") == false) {
		e.stopPropagation();
	}
}

var AddRequisites = function() {
	var requisites = $('#requisites-body');
	var id = $('.requisites-form').length;
	var html = '<div class="portlet box blue"><div class="portlet-title"><div class="caption"><i class="fa fa-building-o"></i><span class="caption-subject bold uppercase"> Реквизиты</span></div><div class="tools"><a href="javascript:;" class="remove" data-original-title="" title="" onclick="DeleteRequisites(event)"></a></div></div><div class="portlet-body"><form class="form-horizontal requisites-form" role="form"><div class="form-body"><div class="form-group"><label class="col-md-3 control-label">Тип контрагента</label><div class="col-md-9"><select class="form-control" name="type"><option value="1">Юридическое лицо</option><option value="2">Индивидуальный предприниматель</option><option value="3">Физическое лицо</option><option selected="" disabled="" hidden="" style="display: none" value=""></option></select></div></div><div class="form-group"><label class="col-md-3 control-label">Полное наименование</label><div class="col-md-9"><input type="text" class="form-control" name="name" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Юридический адресс</label><div class="col-md-9"><textarea class="form-control" rows="3" name="address"></textarea></div></div><div class="form-group"><label class="col-md-3 control-label">ИНН</label><div class="col-md-9"><input type="text" class="form-control" name="inn" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">КПП</label><div class="col-md-9"><input type="text" class="form-control" name="kpp" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">ОГРН</label><div class="col-md-9"><input type="text" class="form-control" name="ogrn" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">ОКПО</label><div class="col-md-9"><input type="text" class="form-control" name="okpo" placeholder="..." value=""></div></div></div></form><div class="row"><div class="col-md-9 col-md-offset-3"><label class="radio-inline"><input type="radio" name="requisites-default" value="'+id+'"> Реквизиты по умолчанию</label></div><div class="col-md-12"><br></div></div><div id="accounts-'+id+'"></div><div class="row"><div class="col-md-3"><a href="javascript:;" class="btn btn-sm green" onclick="AddAccount('+id+')"><i class="fa fa-plus"></i> Добавить счёт</a></div></div></div></div>';
	requisites.append(html);
}

var AddAddress = function() {
	var address = $('#address');
	var id = $('.address-form').length;
	var html = '<div class="portlet box blue" id="address-'+id+'"><div class="portlet-title"><div class="caption"><i class="fa fa-map-marker"></i><span class="caption-subject bold uppercase"> Адрес доставки #'+(id+1)+'</span></div><div class="tools"><a href="javascript:;" class="remove" data-original-title="" title="" onclick="DeleteAddress(event)"></a></div></div><div class="portlet-body"><form class="form-horizontal address-form" role="form"><div class="form-body"><div class="form-group"><label class="col-md-3 control-label">Город</label><div class="col-md-9"><input type="text" class="form-control" name="city" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Улица</label><div class="col-md-9"><input type="text" class="form-control" name="street" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Дом</label><div class="col-md-9"><input type="text" class="form-control" name="house" placeholder="д. 1с1 или д. 1, стр. 1" value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Квартира/офис</label><div class="col-md-9"><input type="text" class="form-control" name="flat" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Комментарий</label><div class="col-md-9"><textarea class="form-control" rows="3" name="comment"></textarea></div></div></div></form><div class="row"><div class="col-md-9 col-md-offset-3"><label class="radio-inline"><input type="radio" name="address-default" value="'+id+'"> Адрес по умолчанию</label></div></div></div></div>';
	address.append(html);
}

var DeleteAddress = function(e) {
	if (confirm("Вы действительно хотите удалить этот адрес?") == false) {
		e.stopPropagation();
	}
}

var AddContacts = function() {
	var contacts = $('#contacts');
	var id = $('.contact-form').length;
	var html = '<div class="portlet box blue" id="contact-'+id+'"><div class="portlet-title"><div class="caption"><i class="fa fa-users"></i><span class="caption-subject bold uppercase"> Контакт #'+(id+1)+'</span></div><div class="tools"><a href="javascript:;" class="remove" data-original-title="" title="" onclick="DeleteContacts(event)"></a></div></div><div class="portlet-body"><form class="form-horizontal contact-form" role="form"><div class="form-body"><div class="form-group"><div class="col-md-12 control-label"><input type="text" placeholder="Имя Фамилия" class="form-control" name="name" value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Должность</label><div class="col-md-9"><input type="text" class="form-control" name="position" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Телефон моб.</label><div class="col-md-9"><input type="text" class="form-control" name="cellphone" placeholder="74950000000" value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Телефон раб.</label><div class="col-md-9"><input type="text" class="form-control" name="workphone" placeholder="..." value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Email</label><div class="col-md-9"><input type="text" class="form-control" name="email" placeholder="info@ivamar.pro" value=""></div></div><div class="form-group"><label class="col-md-3 control-label">Skype</label><div class="col-md-9"><input type="text" class="form-control" name="skype" placeholder="..." value=""></div></div></div></form></div></div>';
	contacts.append(html);
}

var DeleteContacts = function(e) {
	if (confirm("Вы действительно хотите удалить этот контакт?") == false) {
		e.stopPropagation();
	}
}

var Save = function() {
	var general = GetGeneralInfo();
	var contacts = GetContactsInfo();
	var address = GetAddressInfo();
	var requisites = GetRequisitesInfo();
	var accounts = GetAccountsInfo();

	$.post('/agents/edit', {
		general : general,
		contacts : contacts,
		address : address,
		requisites : requisites,
		accounts : accounts
	}, function(res) {
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
		window.location.href = '/agents';
	}
}

var Delete = function() {
	var id = $('#agent-id').val();

	if (id != 'new') {
		if (confirm("Вы действительно хотите удалить контрагента?") == true) {
			$.post('/agents/delete', {id : id}, function(res) {
				window.location.href = '/agents';
			});
		}
	} else {
		window.location.href = '/agents';
	}
}
