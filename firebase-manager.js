var Firebase = require("firebase");

var _token = process.argv[4];
var _ref;
var _authData;

module.exports.connect = function(url) {
    _ref = new Firebase(url);
    _ref.authWithCustomToken(_token, function(error, authData) {
    	if (!error) {
    		_authData = authData;
    	} else {
    		console.log("Error on connect");
    	}
    });
}

module.exports.ref = function() {
    return _ref;
}
