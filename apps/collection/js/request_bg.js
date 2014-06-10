'use strict';
/* global Promise */

(function(exports) {

  function RequestBGImage(requestParams) {

    var eme = exports.eme;
    var resolve;

    var promise = new Promise(function(_resolve) {
      resolve = _resolve;
    });

    if (navigator.onLine) {
      onOnline();
    } else {
      window.addEventListener('online', onOnline);
    }

    function onOnline() {
      eme.api.Search.bgimage(requestParams)
        .then(function success(bgResponse) {
          window.removeEventListener('online', onOnline);

          var image = bgResponse.response.image;
          if (image) {
            var src = image.data;
            if (/image\//.test(image.MIMEType)) {  // base64 image data
              src = 'data:' + image.MIMEType + ';base64,' + image.data;
            }

            resolve(src);
          } else {
            // TODO show default image?
          }
        });
    }

    return promise;
  }

  exports.RequestBGImage = RequestBGImage;

}(window));
