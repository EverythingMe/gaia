'use strict';

(function(eme) {

  eme.init();

  var elements = {
    suggestions: document.getElementById('suggestions'),
    results: document.getElementById('results')
  }

  var Activities = {
    'create-collection': function(activity) {

      eme.api.Categories.list().then(function success(response) {
        var frag = document.createDocumentFragment();
        response.response.categories.forEach(function each(suggestion) {
          var li = document.createElement('li');

          li.textContent = suggestion.query;
          li.dataset.query = suggestion.query;
          li.dataset.categoryId =suggestion.categoryId;
          li.addEventListener('click', select.bind(li));

          frag.appendChild(li);
        });

        elements.suggestions.appendChild(frag);

        function select() {
          this.removeEventListener('click', select);

          // Build and save a fake collection object
          var collection = {
            // I think home2 should generate the id @kevingrandon
            id: Date.now() + '',
            name: this.dataset.query,
            categoryId: this.dataset.categoryId
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
      var categoryId = activity.source.categoryId;
      var frag = document.createDocumentFragment();

      eme.api.Apps.search({categoryId: categoryId}).then(
        function success(response) {
          response.response.apps.forEach(function each(app) {
            var
            li = document.createElement('li'),
            img = document.createElement('img');

            img.src = app.icon;

            li.className = 'app-result';
            li.textContent = app.name;
            li.addEventListener('click', launch.bind(app));
            li.appendChild(img);

            frag.appendChild(li);
          });

          elements.results.appendChild(frag);
        },
        function error(){
          alert('view-collection error');
        }).catch(function fail() {
          alert('view-collection fail');
        });

      function launch() {
        window.open(this.appUrl);
      }

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
