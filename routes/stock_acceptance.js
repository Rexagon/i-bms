var express = require('express');
var app = require('../app');
var router = express.Router();
require('../date-prettify.js');

router.get('/stock/acceptance', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;

	var acceptance = {
    date : (new Date()).format('dd-mm-yyyy')
  };

	res.render('template', {
		authData: authData,
		title: 'Склад',
		styles: [
      'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
    ],
		scripts: [
      'assets/global/plugins/moment.min.js',
      'assets/global/plugins/bootstrap-daterangepicker/daterangepicker.min.js',
      'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
      'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
      //'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
      'assets/pages/scripts/components-date-time-pickers.min.js'
    ],
		page: 'stock_acceptance',
		section: 'stock',
		acceptance: acceptance
	});
});

module.exports = router;
