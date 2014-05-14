'use strict';
/* global Promise */

(function(exports) {

  var eme = exports.eme;
  eme.init();

  function buildCollections(categoryIds, responseData) {
    var
    icons = responseData.icons,
    categories = responseData.categories.filter(function _filter(cat) {
      return categoryIds.indexOf(cat.categoryId) > -1;
    });


    // add 'id' and 'icons' properties
    for (var i = 0, iLen = categories.length; i < iLen; i++) {
      var cat = categories[i];

      // I think home2 should generate the id @kevingrandon
      cat.id = Date.now() + '';

      cat.name = cat.query;

      cat.icons = cat.appIds.map(function getIcon(iconId) {
        return responseData.icons[iconId];
      });
    }

    return categories;
  }

  var Activities = {
    'create-collection': function(activity) {

      eme.api.Categories.list().then(
        function success(response) {
          var data = response.response;
          if (data.categories.length) {
            var suggest = Suggestions.load(data.categories, data.locale);
            suggest.then(
              function select(categoryIds) {
                eme.log('resolved with', categoryIds);

                var
                collections = buildCollections(categoryIds, data),
                trxs = collections.map(CollectionsDatabase.add);

                // TODO
                // store a batch of collections at once. possible?
                Promise.all(trxs).then(done, done);

                function done() {
                  activity.postResult(true);
                }
              }, function cancel(reason) {
                eme.log('rejected with', reason);
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
