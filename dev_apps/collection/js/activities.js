'use strict';
/* global Bookmark */

(function(exports) {

  var eme = exports.eme;
  eme.init();

  var Activities = {
    'create-collection': function(activity) {
      var suggestions = document.getElementById('suggestions');

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

        suggestions.appendChild(frag);

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

      }, function error(e) {
        eme.log('create-collection: error', e);
        alert('create-collection: error');
      }).catch(function fail(ex) {
        eme.log('create-collection: failed', ex);
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
      try {
      var
      bgimage = document.getElementById('bgimage'),
      categoryId = activity.source.categoryId;

      eme.api.Apps.search({categoryId: categoryId}).then(
        function success(response) {
          response.response.apps.forEach(function each(webapp) {
            var bookmark = new Bookmark({
              id: webapp.id, // e.me app id (int)
              name: webapp.name,
              url: webapp.appUrl,
              icon: webapp.icon
            });

            app.addItem(bookmark);
          });

          app.render();
        },
        function error(e){
          alert('view-collection error', e);
        })
      .catch(function fail(ex) {
        eme.log('evme', ex);
        alert('view-collection fail');
      });

      eme.api.Search.bgimage({categoryId: categoryId}).then(
        function success(response) {
          eme.log('evme', 'response', JSON.stringify(response));
          var
          image = response.response.image,
          src = 'data:' + image.MIMEType + ';base64,' + image.data;

          bgimage.src = src;

        }, function error() {
          alert('bgimage fail')
        })
      .catch(function fail(ex) {
        eme.log('evme', ex);
        alert('bgimage fail', ex);
      });

      document.getElementById('close').addEventListener('click', function() {
        activity.postResult(true);
      });
    }
    catch(ex) {
      eme.log('evme', ex);
    }
    },
  };

  navigator.mozSetMessageHandler('activity', function onActivity(activity) {
    var name = activity.source.name;
    Activities[name](activity);
  });

  exports.Activities = Activities;

}(window));
