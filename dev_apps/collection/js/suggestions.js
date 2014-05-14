'use strict';
/* global Promise */


(function(exports) {

  var
  _map = Array.prototype.map,
  CUSTOM = 'custom',
  WORLDWIDE_LOCALE = 'en_WW';

  // TODO
  // - loader?
  // - cache the suggestions response (to be used when device is offline)
  // - offline message when no collection list in cache and device is offline
  // - translate collections names when device language changes (requires server
  //   side changes)
  // - l10n keys
  //

  function Suggestions(categories) {
    this.el = document.getElementById('collections-select');
    this.el.addEventListener('blur', this.handleEvent.bind(this));
    this.el.addEventListener('change', this.handleEvent.bind(this));
    this.hide();

    this.load = function suggestions_load(categories, locale) {
      this.clear();

      var promise = new Promise(function done(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;

        var
        doTranslate = locale !== WORLDWIDE_LOCALE,
        frag = document.createDocumentFragment(),
        custom = document.createElement('option');
        custom.value = CUSTOM;

        // TODO l10n
        custom.textContent = 'l10n-custom';
        frag.appendChild(custom);

        if (doTranslate) {
          // TODO
          // see bug 968998
          // translate and sort categories
        }

        categories.forEach(function each(category) {
          var el = document.createElement('option');

          el.value = el.textContent = category.query;
          el.dataset.query = category.query;
          el.dataset.categoryId = category.categoryId;

          frag.appendChild(el);
        });

        this.el.appendChild(frag);
        this.show();
      }.bind(this));

      return promise;
    }
  };

  Suggestions.prototype = {
    handleEvent: function suggestions_evnethandler(e) {
      var value = this.el.value;

      switch (e.type) {
        case 'blur':
          this.hide();
          var selected = _map.call(this.el.querySelectorAll('option:checked'),
            function getId(opt) {
              return parseInt(opt.dataset.categoryId);
            });

          if (selected.length) {
            this.resolve(selected);
          } else {
            this.reject('cancelled');
          }
          break;
        case 'change':
          if (value === CUSTOM) {
            this.hide();

            // TODO l10n
            var query = window.prompt('prompt-create-custom');
            if (query) {
              this.resolve(query);
            } else {
              this.reject('cancelled');
            }
          }
          break;
      }
    },
    clear: function suggestions_clear() {
      this.el.innerHTML = '';
    },
    show: function suggestions_show() {
      this.el.style.display = 'block';
      this.el.focus();
    },
    hide: function suggestions_hide() {
      this.el.blur();
      this.el.style.display = 'none';
    }
  };

  exports.Suggestions = new Suggestions();
})(window)