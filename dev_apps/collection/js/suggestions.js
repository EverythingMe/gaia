'use strict';
/* global Promise */


(function(exports) {
  function Suggestions() {
    this.el = document.getElementById('suggestions');
  }

  Suggestions.prototype = {
    load: function(categories) {
      // TODO
      // this will be an async call that displays a select element
      // returns a promise resolved when the user selects a category
      // and rejected on cancel
      var promise = new Promise(function done(resolve, reject) {
        var frag = document.createDocumentFragment();

        var cancel = document.createElement('li');
        cancel.textContent = 'Cancel';
        cancel.addEventListener('click', function() {
          reject('cancelled');
        });
        frag.appendChild(cancel);

        categories.forEach(function each(category) {
          var li = document.createElement('li');

          li.textContent = category.query;
          li.dataset.query = category.query;
          li.dataset.categoryId =category.categoryId;
          li.addEventListener('click', function select() {
            resolve(category);
          });

          frag.appendChild(li);
        });

        this.el.appendChild(frag);
      }.bind(this));

      return promise;
    }
  }

  exports.Suggestions = new Suggestions();
})(window)