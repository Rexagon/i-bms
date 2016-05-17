function restoreRow(oTable, nRow) {
	var aData = oTable.fnGetData(nRow);
	var jqTds = $('>td', nRow);
	for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
		oTable.fnUpdate(aData[i], nRow, i, false);
	}
	oTable.fnDraw();
}

var handleCountriesTable = function() {
	var nNew = false;
	var nCurrentName = '';

	function editRow(oTable, nRow) {
		var aData = oTable.fnGetData(nRow);
		var jqTds = $('>td', nRow);
		nCurrentName = aData[0];
		jqTds[0].innerHTML = '<input type="text" class="form-control" value="' + nCurrentName + '">';
		jqTds[1].innerHTML = '<div class="btn-group"><button class="btn green btn-outline edit btn-icon-only" title="Сохранить"><i class="fa fa-edit"></i></button><button class="btn red btn-outline cancel btn-icon-only" title="Отменить"><i class="fa fa-times"></i></button></div>';

		var input = $(jqTds[0]).find('input');
		input.focus();

		var strLength = input.val().length * 2;
		input[0].setSelectionRange(strLength, strLength);
	}

	function saveRow(oTable, nRow, callback) {
		var name = $('input', nRow)[0].value;
		var id = $(nRow).attr('id');

		$.post('/directory/countries/edit', {
			id: id,
			name: name,
			isNew: nNew
		}, function(result) {
			if (result.text == '' || nCurrentName == name) {
				oTable.fnUpdate(name, nRow, 0, false);
				oTable.fnUpdate('<div class="btn-group"><button class="btn green btn-outline edit btn-icon-only" title="Изменить"><i class="fa fa-edit"></i></button><button class="btn red btn-outline delete btn-icon-only" title="Удалить"><i class="fa fa-times"></i></button></div>', nRow, 1, false);
				$(nRow).attr('id', result.id);
				oTable.fnDraw();
				nNew = false;
				callback();
			} else {
				alert(result);
			}
		});
	}

	var table = $('#table-countries');

	var oTable = table.dataTable({
		"lengthMenu": [
			[10, 30, 50, -1],
			[10, 30, 50, "All"]
		],
		"pageLength": 10,
		"language": {
			"lengthMenu": " _MENU_ записей"
		},
		"columnDefs": [{
			'orderable': true,
			'targets': [0]
		}, {
			"searchable": true,
			"targets": [0]
		}],
		"order": [
			[0, "asc"]
		]
	});

	var nEditing = null;

	$('#table-countries-new').click(function(e) {
		e.preventDefault();

		if (nNew && nEditing) {
			if (confirm("Предыдущая строка не сохранена. Хотите сохранить?")) {
				saveRow(oTable, nEditing); // save
				$(nEditing).find("td:first").html("Untitled");
				nEditing = null;
				nNew = false;
			} else {
				oTable.fnDeleteRow(nEditing); // cancel
				nEditing = null;
				nNew = false;

				return;
			}
		}

		var aiNew = oTable.fnAddData(['', '', '']);
		var nRow = oTable.fnGetNodes(aiNew[0]);
		editRow(oTable, nRow);
		nEditing = nRow;
		nNew = true;
	});

	table.on('click', '.delete', function(e) {
		e.preventDefault();

		if (confirm("Вы действительно хотите удалить эту строку?") == false) {
			return;
		}

		var nRow = $(this).parents('tr')[0];

		$.post('/directory/countries/delete', {
			id: $(nRow).attr('id')
		}, function(res) {
			oTable.fnDeleteRow(nRow);
		});
	});

	table.on('click', '.cancel', function(e) {
		e.preventDefault();
		if (nNew) {
			oTable.fnDeleteRow(nEditing);
			nEditing = null;
			nNew = false;
		} else {
			restoreRow(oTable, nEditing);
			nEditing = null;
		}
	});

	table.on('click', '.edit', function(e) {
		e.preventDefault();

		var nRow = $(this).parents('tr')[0];

		if (nEditing !== null && nEditing != nRow) {
			restoreRow(oTable, nEditing);
			editRow(oTable, nRow);
			nEditing = nRow;
		} else if (nEditing == nRow && $(this).attr('title') == "Сохранить") {
			saveRow(oTable, nEditing, function() {
				nEditing = null;
			});
		} else {
			editRow(oTable, nRow);
			nEditing = nRow;
		}
	});
}

var handleAppAreaTable = function() {
	var nNew = false;
	var nCurrentName = '';

	function editRow(oTable, nRow) {
		var aData = oTable.fnGetData(nRow);
		var jqTds = $('>td', nRow);
		nCurrentName = aData[0];
		jqTds[0].innerHTML = '<input type="text" class="form-control" value="' + nCurrentName + '">';
		jqTds[1].innerHTML = '<div class="btn-group"><button class="btn green btn-outline edit btn-icon-only" title="Сохранить"><i class="fa fa-edit"></i></button><button class="btn red btn-outline cancel btn-icon-only" title="Отменить"><i class="fa fa-times"></i></button></div>';

		var input = $(jqTds[0]).find('input');
		input.focus();

		var strLength = input.val().length * 2;
		input[0].setSelectionRange(strLength, strLength);
	}

	function saveRow(oTable, nRow, callback) {
		var name = $('input', nRow)[0].value;
		var id = $(nRow).attr('id');

		$.post('/directory/app_area/edit', {
			id: id,
			name: name,
			isNew: nNew
		}, function(result) {
			if (result.text == '' || nCurrentName == name) {
				oTable.fnUpdate(name, nRow, 0, false);
				oTable.fnUpdate('<div class="btn-group"><button class="btn green btn-outline edit btn-icon-only" title="Изменить"><i class="fa fa-edit"></i></button><button class="btn red btn-outline delete btn-icon-only" title="Удалить"><i class="fa fa-times"></i></button></div>', nRow, 1, false);
				$(nRow).attr('id', result.id);
				oTable.fnDraw();
				nNew = false;
				callback();
			} else {
				alert(result);
			}
		});
	}

	var table = $('#table-apparea');

	var oTable = table.dataTable({
		"lengthMenu": [
			[10, 30, 50, -1],
			[10, 30, 50, "All"]
		],
		"pageLength": 10,
		"language": {
			"lengthMenu": " _MENU_ записей"
		},
		"columnDefs": [{
			'orderable': true,
			'targets': [0]
		}, {
			"searchable": true,
			"targets": [0]
		}],
		"order": [
			[0, "asc"]
		]
	});

	var nEditing = null;

	$('#table-apparea-new').click(function(e) {
		e.preventDefault();

		if (nNew && nEditing) {
			if (confirm("Предыдущая строка не сохранена. Хотите сохранить?")) {
				saveRow(oTable, nEditing); // save
				$(nEditing).find("td:first").html("Untitled");
				nEditing = null;
				nNew = false;
			} else {
				oTable.fnDeleteRow(nEditing); // cancel
				nEditing = null;
				nNew = false;

				return;
			}
		}

		var aiNew = oTable.fnAddData(['', '', '']);
		var nRow = oTable.fnGetNodes(aiNew[0]);
		editRow(oTable, nRow);
		nEditing = nRow;
		nNew = true;
	});

	table.on('click', '.delete', function(e) {
		e.preventDefault();

		if (confirm("Вы действительно хотите удалить эту строку?") == false) {
			return;
		}

		var nRow = $(this).parents('tr')[0];

		$.post('/directory/app_area/delete', {
			id: $(nRow).attr('id')
		}, function(res) {
			oTable.fnDeleteRow(nRow);
		});
	});

	table.on('click', '.cancel', function(e) {
		e.preventDefault();
		if (nNew) {
			oTable.fnDeleteRow(nEditing);
			nEditing = null;
			nNew = false;
		} else {
			restoreRow(oTable, nEditing);
			nEditing = null;
		}
	});

	table.on('click', '.edit', function(e) {
		e.preventDefault();

		var nRow = $(this).parents('tr')[0];

		if (nEditing !== null && nEditing != nRow) {
			restoreRow(oTable, nEditing);
			editRow(oTable, nRow);
			nEditing = nRow;
		} else if (nEditing == nRow && $(this).attr('title') == "Сохранить") {
			saveRow(oTable, nEditing, function() {
				nEditing = null;
			});
		} else {
			editRow(oTable, nRow);
			nEditing = nRow;
		}
	});
}

var handleWarehousesAreaTable = function() {
	var nNew = false;
	var nCurrentName = '';

	function editRow(oTable, nRow) {
		var aData = oTable.fnGetData(nRow);
		var jqTds = $('>td', nRow);
		nCurrentName = aData[0];
		jqTds[0].innerHTML = '<input type="text" class="form-control" value="' + nCurrentName + '">';
		jqTds[1].innerHTML = '<div class="btn-group"><button class="btn green btn-outline edit btn-icon-only" title="Сохранить"><i class="fa fa-edit"></i></button><button class="btn red btn-outline cancel btn-icon-only" title="Отменить"><i class="fa fa-times"></i></button></div>';

		var input = $(jqTds[0]).find('input');
		input.focus();

		var strLength = input.val().length * 2;
		input[0].setSelectionRange(strLength, strLength);
	}

	function saveRow(oTable, nRow, callback) {
		var name = $('input', nRow)[0].value;
		var id = $(nRow).attr('id');

		$.post('/directory/warehouses/edit', {
			id: id,
			name: name,
			isNew: nNew
		}, function(result) {
			if (result.text == '' || nCurrentName == name) {
				oTable.fnUpdate(name, nRow, 0, false);
				oTable.fnUpdate('<div class="btn-group"><button class="btn green btn-outline edit btn-icon-only" title="Изменить"><i class="fa fa-edit"></i></button><button class="btn red btn-outline delete btn-icon-only" title="Удалить"><i class="fa fa-times"></i></button></div>', nRow, 1, false);
				$(nRow).attr('id', result.id);
				oTable.fnDraw();
				nNew = false;
				callback();
			} else {
				alert(result);
			}
		});
	}

	var table = $('#table-warehouses');

	var oTable = table.dataTable({
		"lengthMenu": [
			[10, 30, 50, -1],
			[10, 30, 50, "All"]
		],
		"pageLength": 10,
		"language": {
			"lengthMenu": " _MENU_ записей"
		},
		"columnDefs": [{
			'orderable': true,
			'targets': [0]
		}, {
			"searchable": true,
			"targets": [0]
		}],
		"order": [
			[0, "asc"]
		]
	});

	var nEditing = null;

	$('#table-warehouses-new').click(function(e) {
		e.preventDefault();

		if (nNew && nEditing) {
			if (confirm("Предыдущая строка не сохранена. Хотите сохранить?")) {
				saveRow(oTable, nEditing); // save
				$(nEditing).find("td:first").html("Untitled");
				nEditing = null;
				nNew = false;
			} else {
				oTable.fnDeleteRow(nEditing); // cancel
				nEditing = null;
				nNew = false;

				return;
			}
		}

		var aiNew = oTable.fnAddData(['', '', '']);
		var nRow = oTable.fnGetNodes(aiNew[0]);
		editRow(oTable, nRow);
		nEditing = nRow;
		nNew = true;
	});

	table.on('click', '.delete', function(e) {
		e.preventDefault();

		if (confirm("Вы действительно хотите удалить эту строку?") == false) {
			return;
		}

		var nRow = $(this).parents('tr')[0];

		$.post('/directory/warehouses/delete', {
			id: $(nRow).attr('id')
		}, function(res) {
			oTable.fnDeleteRow(nRow);
		});
	});

	table.on('click', '.cancel', function(e) {
		e.preventDefault();
		if (nNew) {
			oTable.fnDeleteRow(nEditing);
			nEditing = null;
			nNew = false;
		} else {
			restoreRow(oTable, nEditing);
			nEditing = null;
		}
	});

	table.on('click', '.edit', function(e) {
		e.preventDefault();

		var nRow = $(this).parents('tr')[0];

		if (nEditing !== null && nEditing != nRow) {
			restoreRow(oTable, nEditing);
			editRow(oTable, nRow);
			nEditing = nRow;
		} else if (nEditing == nRow && $(this).attr('title') == "Сохранить") {
			saveRow(oTable, nEditing, function() {
				nEditing = null;
			});
		} else {
			editRow(oTable, nRow);
			nEditing = nRow;
		}
	});
}

jQuery(document).ready(function() {
	handleCountriesTable();
	handleAppAreaTable();
	handleWarehousesAreaTable();
});
