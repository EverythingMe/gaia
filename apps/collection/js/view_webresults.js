'use strict';
/* global eme */
/* global Promise */

(function(exports) {

  function ViewWebResults(collectionName, requestParams) {

    var elements = {
      offline: document.getElementById('offline'),
      offlineMessage: document.getElementById('offline-message')
    };

    // make an apps search api request
    // returns api promise resolved with an array of web apps results
    function makeRequest() {
      loading();

      return eme.api.Apps.search(requestParams)
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
          return results;
        }, onResponse);
    }

    function loading(should) {
      document.body.dataset.loading = should !== false;
      elements.offline.classList.remove('show');
    }

    function onResponse() {
      loading(false);
      removeListeners();
    }

    function onOffline() {
      loading(false);

      var msg = navigator.mozL10n.get('offline-webresults', {
        collectionName: collectionName
      });
      elements.offlineMessage.innerHTML = msg;
      elements.offline.classList.add('show');
    }

    function removeListeners() {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', makeRequest);
    }

    if (navigator.onLine) {
      window.addEventListener('offline', onOffline);
      return makeRequest();
    } else {
      return new Promise(function ready(resolve, reject) {
        onOffline();
        window.addEventListener('online', function online() {
          makeRequest().then(resolve, reject);
        });
      });
    }
  }

  exports.ViewWebResults = ViewWebResults;

}(window));
