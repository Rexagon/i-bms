var TableDatatablesEditable = function () {

    var handleTable = function () {

        function restoreRow(oTable, nRow) {
            var aData = oTable.fnGetData(nRow);
            var jqTds = $('>td', nRow);

            for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                oTable.fnUpdate(aData[i], nRow, i, false);
            }

            oTable.fnDraw();
        }

        var nNew = false;
        var nCurrentName = '';

        function editRow(oTable, nRow) {
            var aData = oTable.fnGetData(nRow);
            var jqTds = $('>td', nRow);
            nCurrentName = aData[0];
            jqTds[0].innerHTML = '<input type="text" class="form-control" value="' + nCurrentName + '">';
            jqTds[1].innerHTML = '<a class="edit" href="">Сохранить</a>';
            jqTds[2].innerHTML = '<a class="cancel" href="">Отменить</a>';

            var input = $(jqTds[0]).find('input');
            input.focus();

            var strLength = input.val().length * 2;
            input[0].setSelectionRange(strLength, strLength);
        }

        function saveRow(oTable, nRow, callback) {
            var name = $('input', nRow)[0].value;
            var id = $(nRow).attr('id');

            $.post('/agents/groups/edit', {
                id : id,
                name : name,
                isNew : nNew
            }, function(result) {
                if (result.text == '' || nCurrentName == name) {
                    oTable.fnUpdate(name, nRow, 0, false);
                    oTable.fnUpdate('<a class="edit" href="">Редактировать</a>', nRow, 1, false);
                    oTable.fnUpdate('<a class="delete" href="">Удалить</a>', nRow, 2, false);
                    $(nRow).attr('id', result.id);
                    oTable.fnDraw();
                    nNew = false;
                    callback();
                } else {
                    alert(result);
                }
            });
        }

        var table = $('#table-groups');

        var oTable = table.dataTable({
            "lengthMenu": [
                [20, 30, 50, -1],
                [20, 30, 50, "All"]
            ],
            "pageLength": 20,
            "language": {
                "lengthMenu": " _MENU_ records"
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

        $('#table-groups-new').click(function (e) {
            e.preventDefault();

            if (nNew && nEditing) {
                if (confirm("Предыдущая группа не сохранена. Хотите сохранить?")) {
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

        table.on('click', '.delete', function (e) {
            e.preventDefault();

            if (confirm("Вы действительно хотите удалить эту группу?") == false) {
                return;
            }

            var nRow = $(this).parents('tr')[0];

            $.post('/agents/groups/delete', { id : $(nRow).attr('id') }, function(res) {
                if (res.error) {
                  alert(res.error);
                } else {
                  oTable.fnDeleteRow(nRow);
                }
            });
        });

        table.on('click', '.cancel', function (e) {
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

        table.on('click', '.edit', function (e) {
            e.preventDefault();

            var nRow = $(this).parents('tr')[0];

            if (nEditing !== null && nEditing != nRow) {
                restoreRow(oTable, nEditing);
                editRow(oTable, nRow);
                nEditing = nRow;
            } else if (nEditing == nRow && this.innerHTML == "Сохранить") {
                saveRow(oTable, nEditing, function() {
                    nEditing = null;
                });
            } else {
                editRow(oTable, nRow);
                nEditing = nRow;
            }
        });
    }

    return {
        init: function () {
            handleTable();
        }
    };
}();

jQuery(document).ready(function() {
    TableDatatablesEditable.init();
});
