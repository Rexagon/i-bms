var TableDatatablesAjax = function () {

    var handleRecords = function () {

        var grid = new Datatable();

        grid.init({
            src: $("#agents-datatable"),
            onSuccess: function (grid, response) {
                // grid:        grid object
                // response:    json object of server side ajax response
                // execute some code after table records loaded
            },
            onError: function (grid) {
            },
            onDataLoad: function(grid) {
                // execute some code on ajax data load
            },
            loadingMessage: 'Загрузка...',
            dataTable: {    
                "bStateSave": true,

                "lengthMenu": [
                    [10, 20, 50, 100, 150, -1],
                    [10, 20, 50, 100, 150, "Все"]
                ],
                "pageLength": 10,
                "ajax": {
                    "url": "agents/get",
                },
                "order": [
                    [2, "asc"]
                ],
                "columnDefs": [{
                    'orderable': false,
                    'targets': [0, 1, 3, 4, 5, 6]
                }, {
                    "searchable": false,
                    "targets": [0]
                }],
            }
        });

        grid.clearAjaxParams();
    }

    return {
        init: function () {
            handleRecords();
        }

    };

}();

jQuery(document).ready(function() {
    TableDatatablesAjax.init();
});