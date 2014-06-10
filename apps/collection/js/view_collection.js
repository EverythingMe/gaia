'use strict';
/* global BaseCollection */
/* global Contextmenu */
/* global RequestWebResults */
/* global RequestBGImage */
/* global Promise */

(function(exports) {

  var eme = exports.eme;

  var grid = document.getElementById('grid');

  var elements = {
    content: document.getElementById('content'),
    header: document.getElementById('header'),
    close: document.getElementById('close'),
    name: document.getElementById('name')
  };

  function HandleView(activity) {

    var collection = BaseCollection.create(activity.source.data);
    loading(false);
    collection.render(grid);

    /* jshint -W031 */
    new Contextmenu(collection);

    var categoryId = collection.categoryId;
    var query = collection.query;

    elements.close.addEventListener('click', function close() {
      activity.postResult('close');
    });

    eme.log('view collection', categoryId ? ('categoryId: ' + categoryId)
                                          : ('query: ' + query));

    // render web results
    new RequestWebResults(
      activity.source.data.name, {
      categoryId: categoryId,
      query: query
    }).then(function(results) {
      collection.webResults = results;
      collection.render(grid);
    });

    // get bg image
    new RequestBGImage({
      categoryId: categoryId,
      query: query
    }).then(function(image) {
      elements.content.style.backgroundImage = 'url(' + image + ')';
    });
  }

  navigator.mozSetMessageHandler('activity', function onActivity(activity) {
    if (activity.source.name === 'view-collection') {
      // set collection name to header
      elements.name.textContent = activity.source.data.name;

      // set wallpaper behind header
      getWallpaperImage().then(function(src) {
        elements.header.style.backgroundImage = 'url(' + src + ')';
      });

      loading();

      eme.init().then(function ready() {
        HandleView(activity);
      });
    }
  });

  function getWallpaperImage() {
    return new Promise(function convert(resolve, reject) {
      var req = navigator.mozSettings.createLock().get('wallpaper.image');
      req.onsuccess = function image_onsuccess() {
        var image = req.result['wallpaper.image'];
        if (image instanceof Blob) {
          image = URL.createObjectURL(image);
        }

        resolve(image);
      };
      req.onerror = reject;
    });
  }

  // toggle progress indicator
  function loading(should) {
    document.body.dataset.loading = should !== false;
  }

  // exporting handler so we can trigger it from testpage.js
  // without mozActivities since we can't debug activities in app manager
  exports.HandleView = HandleView;

}(window));
