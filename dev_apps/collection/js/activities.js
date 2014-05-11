'use strict';

(function(eme) {

  eme.init();

  var Activities = {
    'create-collection': function(activity) {
      var suggestions = document.querySelector('#suggestions');

      eme.api.Categories.list().then(function success(response) {

        var frag = document.createDocumentFragment();
        response.response.categories.forEach(function (cat) {
          var li = document.createElement('li');
          li.textContent = cat.query + ' [' + cat.categoryId + ']';
          frag.appendChild(li);
          li.addEventListener('click', select.bind(li));
        });

        suggestions.appendChild(frag);

        function select() {
          this.removeEventListener('click', select);

          // Build and save a fake collection object
          var collection = {
            id: Date.now() + '',
            name: this.textContent
          };

          CollectionsDatabase.add(collection).then(done, done);

          function done() {
            activity.postResult(true);
          }
        }

      }, function error() {
        alert('create-collection: error');
      }).catch(function fail() {
        alert('create-collection: failed');
      });
    },

    'update-collection': function(activity) {
      alert('Updating collection!');
    },

    'remove-collection': function(activity) {
      alert('Removing collection!');
    },

    'view-collection': function(activity) {
      document.getElementById('close').addEventListener('click', function() {
        activity.postResult(true);
      });
    },
  };

  navigator.mozSetMessageHandler('activity', function onActivity(activity) {
    var name = activity.source.name;
    Activities[name](activity);
  });

}(window.eme));
