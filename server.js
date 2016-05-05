var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var favicon = require('serve-favicon');
var path = require('path');
var fm = require('./firebase-manager.js');

console.log(process.env.NODE_ENV);
var port = process.env.NODE_ENV == "development" ? 1337 : 80;

// Configure app
var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
// Use middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('enoj is the best'));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'enoj is the best',
    cookie: { maxAge: 25920000 /* 3 days */ }
}));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://ivamar.ru');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});
app.use(express.static(path.join(__dirname, 'static')));
app.use(favicon(path.join(__dirname,'static','favicon.ico')));

fm.connect(process.argv[3]);
var exRates = require('./exchange_rates.js');

// Define routes
app.use('/', require('./routes/login'));
app.use('/', require('./routes/index'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/goods'));
app.use('/', require('./routes/goods_groups'));
app.use('/', require('./routes/orders'));
app.use('/', require('./routes/stock'));
app.use('/', require('./routes/leads'));
app.use('/', require('./routes/agents'));
app.use('/', require('./routes/agents_groups'));
app.use('/', require('./routes/tasks'));
app.use('/', require('./routes/admin_users'));
app.use('/', require('./routes/admin_projects'));
app.use('/', require('./routes/directory'));
app.use('/', require('./routes/wiki'));
app.use('/', require('./routes/currency'));

app.use(function(req, res, next) {
	res.status(404).render('error_pages/404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('error_pages/500');
});

// Start server
app.listen(port, function () {
    console.log('Server is running on port', port);
});
