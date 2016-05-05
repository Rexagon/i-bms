var express = require('express');
var router = express.Router();
var generatePassword = require('password-generator');
var app = require('../app');
var fm = require('../firebase-manager');
var mailer = require('../mailer');

router.get('/admin/users', app.restrict, app.restrictPage, function(req, res) {
	var authData = req.session.authData;

    fm.ref().child('users').orderByValue().once('value', function(snapshot) {
        var users = [];

        snapshot.forEach(function(data) {
            var user = data.val();
            delete user.password;
            users.push(user);
        });

        res.render('template', {
            authData : authData,
            title : 'Пользователи',
            styles : [
                'assets/global/plugins/datatables/datatables.min.css',
                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css'
            ],
            scripts : [
                'assets/global/scripts/datatable.js',
                'assets/global/plugins/datatables/datatables.min.js',
                'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js',
                'scripts/admin_users.js'
            ],
            users : users,
            page : 'admin_users',
						section:'admin_users'
        });
    });
});


var AddUser = function(req, callback) {
    var email = req.body.email;
    var name = req.body.name;
    var surname = req.body.surname;
    var position = req.body.position;
    var password = generatePassword(12, false, /[\w\d\p]/);

    var re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (re.test(email)) {
        fm.ref().child('pages').once('value', function(pagesSnapshow) {
            var rights = {};
            var i = 0;
            pagesSnapshow.forEach(function(data) {
                rights[data.key()] = req.body.rights[i];
                i++;
            });

            fm.ref().child('users').orderByChild('email').equalTo(email).once('value', function(snapshot) {
                if (snapshot.exists()) {
                    callback('Пользователь с такой почтой уже существует!');
                } else {
                    fm.ref().child('users').push({
                        email : email,
                        password : password,
                        status : 'offline',
                        access : rights,
                        info : {
                            name : name,
                            surname : surname,
                            phone : '',
                            position : position,
                            about : '',
                            imageUrl : 'https://image.freepik.com/icones-gratis/preto-usuario-fechar-se-forma_318-48677.jpg'
                        }
                    }, function(error) {
                        mailer.send({
                            from: 'IVAMAR <info@ivamar.pro>',
                            to: email,
                            subject: 'Регистрация в Ivamar BMS',
                            text: 'Вы добавлены в IVAMAR BMS.Чтобы войти в систему используйте адрес: http://bms.ivamar.pro/login, логин: '+email+', пароль: '+password+' Спасибо, что вы с нами!',
                            html: 'Вы добавлены в IVAMAR BMS.<br><br>Чтобы войти в систему используйте адрес:<br>http://bms.ivamar.pro/login<br><br>========================<br>Логин: '+email+'<br>Пароль: '+password+'<br>========================<br><br>Спасибо, что вы с нами!'
                        });

                        callback('');
                    });
                }
            });
        });
    } else {
        callback('Электронная почта не является действительной');
    }
}

router.post('/admin/users/edit/info', app.restrict, app.restrictPage, function(req, res) {
    fm.ref().child('users').orderByChild('email').equalTo(req.body.email).once('value', function(snapshot) {
        if (req.body.newUser == 'true') {
            AddUser(req, function(result) {
                res.send(result);
            });
        } else {
            snapshot.forEach(function(data) {
                fm.ref().child('users/' + data.key() + '/info').update({
                    name :      req.body.name,
                    surname :   req.body.surname,
                    position :  req.body.position,
                }, function(error) {
                    res.send('');
                });

                return true;
            });
        }
    });
});

router.post('/admin/users/edit/rights', app.restrict, app.restrictPage, function(req, res) {
    fm.ref().child('users').orderByChild('email').equalTo(req.body.email).once('value', function(snapshot) {
        snapshot.forEach(function(data) {
            var rights = {};
            var i = 0;

            var user = data.val();
            for (page in req.body.rights) {
                rights[page] = req.body.rights[page];
                i++;
            }

            fm.ref().child('users/' + data.key()).update({
                 access : rights,
            }, function(error) {
                res.send('');
            });

            return true;
        });
    });
});

router.post('/admin/users/delete', app.restrict, app.restrictPage, function(req, res) {
    fm.ref().child('users').orderByChild('email').equalTo(req.body.email).once('value', function(snapshot) {
        if (!snapshot.exists()) {
            res.send(false);
        }

        snapshot.forEach(function(data) {
            fm.ref().child('users/' + data.key()).remove(function(error) {
                res.send(!error);
            });

            return true;
        });
    });
});

router.post('/admin/users/get/rights', app.restrict, app.restrictPage, function(req, res) {
    fm.ref().child('pages').once('value', function(snapshot) {
        var rights = [];
        var email = req.body.email;
        var isNewUser = email == '';

        if (isNewUser) {
            snapshot.forEach(function(data) {
                rights.push(data.val().defaultAccess);
            });
            res.send(rights);
        } else {
            fm.ref().child('users').orderByChild('email').equalTo(email).once('value', function(snapshot) {
                snapshot.forEach(function(data){
                    var user = data.val();
                    for (page in user.access) {
                        rights.push(user.access[page]);
                    }
                });

                res.send(rights);
            });
        }
    });
});

router.post('/admin/users/get/pages', app.restrict, app.restrictPage, function(req, res) {
    fm.ref().child('pages').once('value', function(snapshot) {
        var pages = [];

        snapshot.forEach(function(data) {
            pages.push({title: data.val().title, id: data.key()});
        });

        res.send(pages);
    });
});

module.exports = router;
