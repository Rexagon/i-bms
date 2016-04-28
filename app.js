var fm = require("./firebase-manager");

module.exports.restrict = function(req, res, next) {
	if (req.session.authData) {
		req.session.touch();
  		next();
	} else {
  		req.session.error = 'Access denied!';
    	res.redirect('/login');
	}
}

module.exports.restrictPage = function (req, res, next) {
	var re = /\/(\w*)(?:\/\w*)*/;
	var pageName = re.exec(req.url)[1];
	var authData = req.session.authData;

	fm.ref().child('users/' + authData.uid + '/access/' + pageName).once('value', function(data) {
		var accessLevel = data.val();

		authData.access[pageName] = accessLevel;

		if (accessLevel == "all") {
			req.readOnly = false;
			next();
		} else if (accessLevel == "read") {
			req.readOnly = true;
			next();
		} else {
			res.redirect('/');
		}
	});
}

module.exports.path = __dirname;
