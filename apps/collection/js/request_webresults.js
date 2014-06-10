'use strict';
/* global Promise */

(function(exports) {

  function RequestWebResults(collectionName, requestParams) {

    var eme = exports.eme;
    var resolve;
    var elements = {
      offline: document.getElementById('offline'),
      offlineMessage: document.getElementById('offline-message')
    };

    requestParams.iconFormat = 20;

    var promise = new Promise(function(_resolve) {
      resolve = _resolve;
    });

    if (navigator.onLine) {
      onOnline();
    } else {
      onOffline();
    }

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    function onOffline() {
      loading(false);

      var msg = navigator.mozL10n.get('offline-webresults', {
        collectionName: collectionName
      });
      elements.offlineMessage.innerHTML = msg;
      elements.offline.classList.add('show');
    }

    function onOnline() {
      loading();

      eme.api.Apps.search(requestParams)
        .then(function success(searchResponse) {
          var results = [];

          searchResponse.response.apps.forEach(function each(webapp) {
            results.push({
              id: webapp.id, // e.me app id (int)
              name: webapp.name,
              url: webapp.appUrl,
              icon: webapp.icon,
              clipIcon: true
            });
          });

          onResponse();

          resolve(results);
        }, onResponse);
    }

    function loading(should) {
      document.body.dataset.loading = should !== false;
      elements.offline.classList.remove('show');
    }

    function onResponse() {
      loading(false);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    }

    return promise;
  }

  exports.RequestWebResults = RequestWebResults;

}(window));
