
'use strict';

var ConfigParser = (function() {
  var EVME_FILE_PATH = 'everything.me/config/evme.json';

  function load(file, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', file, true);
    xhr.send(null);

    xhr.onload = function _xhrOnLoad(evt) {
      try {
        success(JSON.parse(xhr.responseText));
      } catch (e) {
        error(e);
        console.error('Failed parsing ev.me configuration file: ' + e);
      }
    };

    xhr.onerror = function _xhrOnError(evt) {
      error(evt);
      console.error('File not found: everything.me/config/evme.json');
    };
  }

  return {
    parse: function(success, error) {
      load(EVME_FILE_PATH, success, error);
    }
  };
}());
