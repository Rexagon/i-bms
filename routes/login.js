var express = require('express');
var router = express.Router();
var fm = require('../firebase-manager');

router.get('/login', function(req, res) {
    var tmp;

    if (req.session.login_warning) {
        tmp = req.session.login_warning;
        req.session.login_warning = undefined;
    }

    res.render('login', { login_warning : tmp });
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    fm.ref().child('users').orderByChild('email').equalTo(email).once('value', function(snapshot) {
        snapshot.forEach(function (data) {
            if (data.child('password').val() == password) {
                var authData = data.val();
                authData.uid = data.key();

                req.session.authData = authData;

                if (req.body.remember != 1) {
                    req.session.cookie.expires = false;
                }

                console.log('User connected', authData.email);
                res.redirect('/');
            } else {
                req.session.login_warning = 'Неверная почта или пароль!';
                res.redirect('/login');
            }
            return true;
        });

        if (!snapshot.exists()) {
            req.session.login_warning = 'Неверная почта или пароль!';
            res.redirect('/login');
        }
    });
});

module.exports = router;
