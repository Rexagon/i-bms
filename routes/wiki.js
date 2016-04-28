var express = require('express');
var app = require('../app');
var router = express.Router();
var fm = require('../firebase-manager.js');

router.get('/wiki', app.restrict, app.restrictPage, function(req, res) {
  var authData = req.session.authData;

  fm.ref().child('/agents').once('value', function(agentsSnapshot) {
    var agents = [];
    agentsSnapshot.forEach(function(data) {
      agents.push({ id : data.key(), name : data.val().name });
    });

    fm.ref().child('/projects').once('value', function(projectsSnapshot) {
      var projects = [];
      projectsSnapshot.forEach(function(data) {
        projects.push({ id : data.key(), name : data.val().name });
      });

      fm.ref().child('/wiki_pages/').once('value', function(snapshot) {
        var pages = snapshot.val();

        var page = req.query.page ? req.query.page : 'home';

        if (pages[page] && (((pages[page].access=='admin') && (authData.access.admin == 'all')) || pages[page].access=='all')) {
          res.render('template', {
            authData : authData,
            title :    'Wiki',
            styles :   [],
            scripts :  [
              'assets/global/plugins/list.min.js',
              'scripts/wiki.js'
            ],
            page :     'wiki',
            section :  'wiki',
            pages :    pages,
            article :  pages[page],
            agents :   agents,
            projects : projects
          });
        } else {
          res.redirect('/wiki');
        }
      });
    });
  });
});

router.get('/wiki/edit', app.restrict, app.restrictPage, function(req, res) {
    var authData = req.session.authData;

    var styles = [
        'assets/global/plugins/bootstrap-toastr/toastr.min.css',
        'assets/global/plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.css'
    ];
    var scripts = [
        'assets/global/plugins/bootstrap-toastr/toastr.min.js',
        'assets/global/plugins/bootstrap-wysihtml5/wysihtml5-0.3.0.js',
        'assets/global/plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.js',
        'scripts/wiki_edit.js'
    ];

    if (req.query.page) {
        fm.ref().child('/agents').once('value', function(agentsSnapshot) {
            var agents = [];
            agentsSnapshot.forEach(function(data) {
                agents.push({ id : data.key(), name : data.val().name });
            });

            fm.ref().child('/projects').once('value', function(projectsSnapshot) {
                var projects = [];
                projectsSnapshot.forEach(function(data) {
                    projects.push({ id : data.key(), name : data.val().name });
                });

                if (req.query.page == 'new') {
                    res.render('template', {
                        authData : authData,
                        title :    'Wiki',
                        styles :   styles,
                        scripts :  scripts,
                        page :     'wiki_edit',
                        section :  'wiki',
                        article :  {id: 'new'},
                        agents :   agents,
                        projects : projects
                    });
                } else {
                    fm.ref().child('/wiki_pages/'+req.query.page).once('value', function(snapshot) {
                        if (snapshot.exists()) {
                            var article = snapshot.val();

                            res.render('template', {
                                authData : authData,
                                title :    'Wiki',
                                styles :   styles,
                                scripts :  scripts,
                                page :     'wiki_edit',
                                section :  'wiki',
                                article :  article,
                                agents :   agents,
                                projects : projects
                            });
                        } else {
                            res.redirect('/wiki');
                        }
                    });
                }
            });
        });
    } else {
        res.redirect('/wiki');
    }
});

router.post('/wiki/edit', app.restrict, app.restrictPage, function(req, res) {
    var article = req.body;
    if (article.id == 'new' || article.id=='') {
        var newArticle = fm.ref().child('wiki_pages').push();
        article.id = newArticle.key();

        newArticle.set(article, function(error) {
            var response = { text : 'Данные успешно сохранены', id : article.id };
            res.send(response);
        });
    } else {
        fm.ref().child('wiki_pages/' + article.id).update(article, function(error) {
            var response = { text : 'Данные успешно сохранены' };
            res.send(response);
        });
    }
});

router.post('/wiki/delete', app.restrict, app.restrictPage, function(req, res) {
    fm.ref().child('wiki_pages/'+req.body.id).remove(function(error) {
        res.send('ok');
    });
});

module.exports = router;
