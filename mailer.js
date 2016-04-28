var nodemailer = require('nodemailer');

var smtpConfig = {
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'info@ivamar.pro',
        pass: process.argv[2]
    }
};

var _transporter = nodemailer.createTransport(smtpConfig);

module.exports.send = function(options) {
	_transporter.sendMail(options, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
}
