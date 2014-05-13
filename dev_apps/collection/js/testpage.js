document.getElementById('clear').addEventListener('click',
  function () {
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('icons').innerHTML = '';
    document.getElementById('bgimage').src = '.';
  });

document.getElementById('create-collection').addEventListener('click',
  function() {
    Activities['create-collection']();
  });

document.getElementById('view-collection').addEventListener('click',
  function() {
    var activity = {
      source: {
        postResult: function() {},
        categoryId: 207 // games
      }
    };

    Activities['view-collection'](activity);
  });