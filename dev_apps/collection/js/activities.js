'use strict';
/* global Bookmark */

(function(exports) {

  var eme = exports.eme;
  eme.init();

  var Activities = {
    'create-collection': function(activity) {

      eme.api.Categories.list().then(
        function success(response) {
          if (response.response.categories.length) {
            var showSuggestions = Suggestions.load(response.response.categories);
            showSuggestions.then(
              function select(category) {
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
              }, function cancel() {
                activity.postResult(false);
              });
          } else {
            // TODO
            activity.postError('no more suggestions');
          }

      }, function error(e) {
        eme.log('create-collection: error', e);
        activity.postError();
      }).catch(function fail(ex) {
        eme.log('create-collection: failed', ex);
        activity.postError();
      });
    },

    'update-collection': function(activity) {
      alert('Updating collection!');
    },

    'remove-collection': function(activity) {
      alert('Removing collection!');
    },

    'view-collection': function(activity) {
      var
      categoryId = activity.source.categoryId,
      requests = [
        eme.api.Apps.search({categoryId: categoryId}),
        eme.api.Search.bgimage({categoryId: categoryId})
      ];

      Promise.all(requests).then(
        function success(responseArr) {
          var
          searchResponse = responseArr[0],
          bgResponse = responseArr[1],
          image = bgResponse.response.image,
          src = 'data:' + image.MIMEType + ';base64,' + image.data,
          webapps = searchResponse.response.apps.map(function each(webapp) {
            return {
              id: webapp.id, // e.me app id (int)
              name: webapp.name,
              url: webapp.appUrl,
              icon: webapp.icon
            };
          });

          activity.postResult({
            webapps: searchResponse.response.apps,
            imageSrc: src
          });
        },
        function error(e) {
          eme.log(e);
          alert('view-collection error', e);
          activity.postError(e);
        })
      .catch(function fail(e) {
        eme.log(e);
        alert('view-collection fail', e);
        activity.postError(e);
      });
    },
  };

  navigator.mozSetMessageHandler('activity', function onActivity(activity) {
    var name = activity.source.name;
    Activities[name](activity);
  });

  exports.Activities = Activities;

}(window));
