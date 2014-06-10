'use strict';
/* global eme */
/* global Promise */

(function(exports) {

  function ViewBackground(options) {

    // make a bg image api request
    // returns api promise resolved with an img src or null
    function makeRequest() {
      return eme.api.Search.bgimage(options)
        .then(function success(bgResponse) {
          window.removeEventListener('online', makeRequest);

          var image = bgResponse.response.image;
          if (image) {
            var src = image.data;
            if (/image\//.test(image.MIMEType)) { // base64 image data
              src = 'data:' + image.MIMEType + ';base64,' + image.data;
            }

            return src;

          } else {
            // TODO show default image?
            return null;
          }
        });
    }

    if (navigator.onLine) {
      return makeRequest();
    } else {
      // return a promise that will resolve/reject when back online
      return new Promise(function ready(resolve, reject) {
        window.addEventListener('online', function online() {
          return makeRequest().then(resolve, reject);
        });
      });
    }
  }

  exports.ViewBackground = ViewBackground;

}(window));
