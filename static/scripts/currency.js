var TableDatatablesAjax = function () {
    var handleRecords = function () {

        var grid = new Datatable();

        grid.init({
            src: $("#table"),
            loadingMessage: 'Loading...',
            dataTable: {
                "lengthMenu": [
                    [10, 20, 50, 100, 150, -1],
                    [10, 20, 50, 100, 150, "Все"]
                ],
                "pageLength": 10,
                "ajax": {
                    "url": "/currency/get_rates/",
                }
            }
        });
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
