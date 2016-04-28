var grid = new Datatable();

$('#search-btn').on('click', function(e) {
  e.preventDefault();
  grid.setAjaxParam('product_instock', $('#instock').prop('checked'));
  grid.getDataTable().ajax.reload();
});

$('#cancel-btn').on('click', function(e) {
  $('.form-filter').val('');
  grid.clearAjaxParams();
  grid.setAjaxParam('group', currentGroupId);
  grid.getDataTable().ajax.reload();
});

$(document).keypress(function(e) {
  if(e.which == 13) {
    $('#search-btn').click();
  }
});

$(document).ready(function() {
  $('#tree').jstree({
    core : {
      themes : {
        responsive: false
      },
      check_callback : true,
      multiple : false,
      data : {
        url : function (node) {
          return '/goods/groups';
        },
        data : function (node) {
          return { 'parent' : node.id };
        }
      }
    },
    types : { default : { icon : 'fa fa-folder icon-state-warning icon-lg' } },
    plugins : [ 'contextmenu', 'dnd', 'types' ],
    contextmenu : {
      items : function(node) {
        var tree = this;
        var items = {
          createItem: {
            label: 'Создать',
            action: function (obj) {
              id = tree.create_node(node);
              tree.edit(id);
            }
          },
          renameItem: {
            label: 'Переименовать',
            action: function (obj) {
              tree.edit(node);
            }
          },
          editItem: {
            label: 'Изменить',
            action: function (obj) {
              window.location.href = '/goods/groups/edit?id='+node.id;
            }
          },
          deleteItem: {
            label: 'Удалить',
            action: function (obj) {
              if (confirm('Вы действительно хотите удалить группу?') == true) {
                tree.delete_node(node);
              }
            }
          }
        };

        if (node.id == 'root') {
          delete items.renameItem;
          delete items.deleteItem;
          delete items.editItem;
        }

        return items;
      }
    }
  }).on('create_node.jstree', function(e, data) { //@TODO: сделать уведомление об успешности операции
    $.post('/goods/groups/add', {parent: data.node.parent, text: data.node.text, position: data.position}, function(res) {
      data.instance.set_id(data.node, res.id);
    });
  }).on('rename_node.jstree', function(e, data) { //@TODO: сделать уведомление об успешности операции
    $.post('/goods/groups/rename', {id: data.node.id, text: data.text}, function(res) {});
  }).on('delete_node.jstree', function(e, data) { //@TODO: сделать уведомление об успешности операции
    $.post('/goods/groups/delete', {id: data.node.id}, function(res) {
      if (res.error) {
        data.instance.refresh();
        alert(res.error);
      }
      grid.clearAjaxParams();
      grid.getDataTable().ajax.reload();
    });
  }).on('move_node.jstree', function(e, data) {
    if (data.parent != '#') {
      $.post('/goods/groups/move', {id: data.node.id, position: data.node.id, parent: data.parent}, function(res) {});
    } else {
      data.instance.refresh();
    }
  }).on('select_node.jstree', function(e, data) {
    grid.clearAjaxParams();
    $('#new-product-btn').attr('href', '/goods/edit?id=new&group='+data.selected[0]);
    currentGroupId = data.selected[0];
    grid.setAjaxParam('group', currentGroupId);
    grid.getDataTable().ajax.reload();
  }).on('loaded.jstree', function () {
    $('#tree').jstree('deselect_all').jstree('select_node', currentGroupId);
  });

  grid.init({
    src: $('#goods-datatable'),
    loadingMessage: 'Загрузка...',
    dataTable: {
      'bStateSave': true,

      'lengthMenu': [
        [10, 20, 50, 100, 150, -1],
        [10, 20, 50, 100, 150, 'Все']
      ],
      'pageLength': 10,
      'ajax': {
        'url': 'goods/get'
      },
      'order': [
        [3, 'asc']
      ],
      'columnDefs': [{
        'orderable': false,
        'targets': [0, 1, 3, 4, 5, 6, 7]
      }, {
        'searchable': false,
        'targets': [0, 1, 7]
      }],
    }
  });
});
