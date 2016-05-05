var express = require('express');
var app = require('../app');
var fm = require('../firebase-manager');
var router = express.Router();

router.get('/currency', app.restrict, app.restrictPage, function(req, res) {
    var authData = req.session.authData;
    res.render('template', {
        authData : authData,
        title :    'Курсы валют',
        styles :   [
          'assets/global/plugins/datatables/datatables.min.css',
          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css'
        ],
        scripts :  [
          'assets/global/scripts/datatable.min.js',
          'assets/global/plugins/datatables/datatables.min.js',
          'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
          'scripts/currency.js'
        ],
        page :     'currency',
        section :  'currency',
    });
});

router.post('/currency/get_rates/', app.restrict, app.restrictPage, function(req, res) {
  fm.ref().child('directory/currency').once('value', function(snapshot) {
    var rates = [];
    snapshot.forEach(function(data) {
      var v = data.val();
      rates.push({date: v.date, usd: v.usd, eur: v.eur});
    });

    var totalRecordsNum = parseInt(rates.length);
    var displayLength = parseInt(req.body.length);
    displayLength = displayLength < 0 ? totalRecordsNum : displayLength;
    var displayStart = parseInt(req.body.start);

    var records = {
      data : [],
      draw : parseInt(req.body.draw),
      recordsTotal : totalRecordsNum,
      recordsFiltered : totalRecordsNum
    };

    var displayEnd = displayStart + displayLength;
    displayEnd = displayEnd > totalRecordsNum ? totalRecordsNum : displayEnd;

    for (var i = displayStart; i < displayEnd; ++i) {
      var v = rates[i];
      records.data.push([
        v.date,
        v.usd,
        v.eur
      ]);
    }

    res.send(records);
  });
});

module.exports = router;
