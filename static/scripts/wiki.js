var options = {
  valueNames: [ 'name', 'agent', 'project' ]
};

var pagesList = new List('pages', options);

var Filter = function() {
  var agent = $('#agent').val();
  var project = $('#project').val();

  pagesList.filter(function(item) {
      return (((item.values().agent == agent) || (agent == '')) &&
              ((item.values().project == project) || (project == '')));
  });
}

Filter();

$('#agent').change(function () {
    Filter();
});

$('#project').change(function () {
    Filter();
});
