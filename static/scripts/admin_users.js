var defaultRights = [];
var pages = [];

var ShowAccessEditTable = function(rights) {
    var html = '<div class="table-scrollable" id="access-table"><table class="table table-hover table-bordered"><thead><tr><th> Раздел </th><th> Уровень доступа </th></tr></thead><tbody>';

    for (var i = 0; i < pages.length; ++i) {
        var access = {all: '', read:'', none:''};

        access[rights[i]] = 'selected';

        html += '<tr><td> ' + pages[i] + '</td><td><select id="access-page-' + i + '" class="form-control input-small input-inline"><option value="all"' + access['all'] + '>Все права</option><option value="read"' + access['read'] + '>Чтение</option><option value="none"' + access['none'] + '>Закрыто</option></select></td></tr>';
    }

    html += '</tbody></table></div>';

    $('#modal-body').html(html);
}

var FillModal = function(email) {
    $('#modal-body').html('<img src="../assets/global/img/loading-spinner-grey.gif" alt="" class="loading"><span> &nbsp;&nbsp;Подождите... </span>');

    $.post('/admin/users/get/rights', { email : email }, function(rights) {
        ShowAccessEditTable(rights);

        var title = 'Права доступа для ' + email;
        $('#access-table-title').text(title);
        $('#modal-save-button').attr('onclick', 'SaveRights("' + email + '")');
    });
}

var currentNewUserRights = [];

var FillNewModal = function() {
    ShowAccessEditTable(currentNewUserRights);
    $('#access-table-title').text("Права доступа");
    $('#modal-save-button').attr('onclick', 'CreateRights()');
}

var SaveRights = function(email) {
    var rights = [];
    var selectElements = document.getElementsByTagName('select');
    for (var i = 1; i < selectElements.length; ++i) {
        rights.push(selectElements[i].options[selectElements[i].selectedIndex].value);
    }

    if (email != '') {
        $.post('/admin/users/edit/rights', { email : email, rights : rights }, function(result) {
            if (result == '') {
                $('#access-table').remove();
            } else {
                alert(result);
            }
        });
    }
}

var CreateRights = function() {
    var rights = [];
    var selectElements = document.getElementsByTagName('select');
    for (var i = 1; i < selectElements.length; ++i) {
        rights.push(selectElements[i].options[selectElements[i].selectedIndex].value);
    }

    currentNewUserRights = rights;
}

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

        function editRow(oTable, nRow, isNewUser) {
            var aData = oTable.fnGetData(nRow);
            var jqTds = $('>td', nRow);

            var title = 'Права доступа';
            if (isNewUser) {
                title += ' для ' + aData[3];
            }

            $('#access-table-title').text(title);

            jqTds[0].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[0] + '">';
            jqTds[1].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[1] + '">';
            jqTds[2].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[2] + '">';
            jqTds[3].innerHTML = '<input type="text" class="form-control input-small"' + (isNewUser ? '' : ' disabled') + ' value="' + aData[3] + '">';
            jqTds[6].innerHTML = '<a class="edit" href="">Сохранить</a>';
            jqTds[7].innerHTML = '<a class="cancel" href="">Отменить</a>';
        }

        function saveRow(oTable, nRow, callback) {
            var jqInputs = $('input', nRow);
            var accesses = [];

            var selectElements = document.getElementsByTagName('select');
            for (var i = 1; i < selectElements.length; ++i) {
                accesses.push(selectElements[i].options[selectElements[i].selectedIndex].value);
            }

            var newUser = (!jqInputs[3].disabled);

            if (jqInputs[3].value != '') {
                $.post('/admin/users/edit/info', { 
                    name : jqInputs[0].value, 
                    surname : jqInputs[1].value, 
                    position : jqInputs[2].value,
                    email : jqInputs[3].value,
                    rights : currentNewUserRights, // only used if is newUser
                    newUser : newUser
                }, function(result) {
                    if (result == '') {
                        oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                        oTable.fnUpdate(jqInputs[1].value, nRow, 1, false);
                        oTable.fnUpdate(jqInputs[2].value, nRow, 2, false);
                        oTable.fnUpdate(jqInputs[3].value, nRow, 3, false);
                        oTable.fnUpdate('<a class="btn default" data-toggle="modal" href="#modal" onclick="FillModal(\'' + jqInputs[3].value + '\')"><i class="fa fa-lock"></i> Изменить</a>', nRow, 5, false);
                        oTable.fnUpdate('<a class="edit" href="">Редактировать</a>', nRow, 6, false);
                        oTable.fnUpdate('<a class="delete" href="">Удалить</a>', nRow, 7, false);
                        oTable.fnDraw();

                        callback(true);
                    } else {
                        alert(result);
                        callback(false);
                    }
                });
            } else {
                alert('Почта обязательно должна быть указана!');
                callback(false);
            }
        }

        var table = $('#table');

        var oTable = table.dataTable({

            // Uncomment below line("dom" parameter) to fix the dropdown overflow issue in the datatable cells. The default datatable layout
            // setup uses scrollable div(table-scrollable) with overflow:auto to enable vertical scroll(see: assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js). 
            // So when dropdowns used the scrollable div should be removed. 
            //"dom": "<'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r>t<'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",

            "lengthMenu": [
                [10, 20, 50, -1],
                [10, 20, 50, "All"] // change per page values here
            ],

            // Or you can use remote translation file
            //"language": {
            //   url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Portuguese.json'
            //},

            // set the initial value
            "pageLength": 10,

            "language": {
                "lengthMenu": " _MENU_ records"
            },
            "columnDefs": [{ // set default column settings
                'orderable': true,
                'targets': [0]
            }, {
                "searchable": true,
                "targets": [0]
            }],
            "order": [
                [0, "asc"]
            ] // set first column as a default sort by asc
        });

        var tableWrapper = $("#table_wrapper");

        var nEditing = null;
        var nNew = false;

        $('#table_new').click(function (e) {
            e.preventDefault();

            if (nNew && nEditing) {
                if (confirm("Предыдущая строка не сохранена. Сохранить?")) {
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

            var aiNew = oTable.fnAddData(['', '', '', '', 
                '<span class="label label-sm label-danger"> Offline </span>', 
                '<a class="btn default" data-toggle="modal" href="#modal" onclick="FillNewModal()"><i class="fa fa-lock"></i> Изменить</a>', '', ''
            ]);

            var nRow = oTable.fnGetNodes(aiNew[0]);
            editRow(oTable, nRow, true);
            nEditing = nRow;
            nNew = true;
        });

        table.on('click', '.delete', function (e) {
            e.preventDefault();

            if (confirm("Вы действительно хотите удалить пользователя ?") == false) {
                return;
            }

            var nRow = $(this).parents('tr')[0];
            var aData = oTable.fnGetData(nRow);

            $.post('/admin/users/delete', {email : aData[3]}, function(success) {
                if (success) oTable.fnDeleteRow(nRow);
            })
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

            /* Get the row as a parent of the link that was clicked on */
            var nRow = $(this).parents('tr')[0];

            if (nEditing !== null && nEditing != nRow) {
                /* Currently editing - but not this row - restore the old before continuing to edit mode */
                restoreRow(oTable, nEditing);
                editRow(oTable, nRow, false);
                nEditing = nRow;
            } else if (nEditing == nRow && this.innerHTML == "Сохранить") {
                /* Editing this row and want to save it */
                saveRow(oTable, nEditing, function(success) {
                    if (success) {
                        nEditing = null;
                    }
                });
            } else {
                /* No edit in progress - let's start one */
                editRow(oTable, nRow, false);
                nEditing = nRow;
            }
        });
    }

    return {

        //main function to initiate the module
        init: function () {
            handleTable();
        }

    };

}();

jQuery(document).ready(function() {
    TableDatatablesEditable.init();

    $.post('/admin/users/get/pages', function(res) {
        pages = res;
    });

    $.post('/admin/users/get/rights', { email : '' }, function(rights) {
        defaultRights = rights;
        currentNewUserRights = rights;
    });
});