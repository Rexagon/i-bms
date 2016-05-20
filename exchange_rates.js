var fm = require('./firebase-manager.js');
var http = require('http');
var parseString = require('xml2js').parseString;
var schedule = require('node-schedule');

var currentRates = {};

var ParseExchangeRates = function(callback) {
  http.get('http://www.cbr.ru/scripts/XML_daily.asp', function(res) {
    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('end', function() {
      parseString(xml, function(err, result) {
        currentRates = {date: result.ValCurs['$'].Date, usd: result.ValCurs.Valute[9].Value[0], eur: result.ValCurs.Valute[10].Value[0]};
        callback(currentRates)
      });
    });
  }).on('error', function(err) {

  });
}

var UpdateExchangeRates = function() {
  ParseExchangeRates(function(res) {
    var date = res.date;

    fm.ref().child('directory/currency/').orderByChild('date').equalTo(date).once('value', function(snapshot) {
      if (snapshot.exists()) {
        snapshot.forEach(function(data) {
          fm.ref().child('directory/currency/' + data.key()).set(res, function(error) { });
        });
      } else {
        fm.ref().child('directory/currency/').push(res, function(error) { });
      }
    });
  });
}

UpdateExchangeRates();
var dayRate = schedule.scheduleJob('0 * 15 * * *', function(){
  UpdateExchangeRates();
});
var reserveRate = schedule.scheduleJob('0 * 19 * * *', function(){
  UpdateExchangeRates();
});

module.exports.current = currentRates;
module.exports.getRates = function(date) {

}
