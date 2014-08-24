'use strict';

/* global BaseCollection */
/* exported CollectionEditor */

var CollectionEditor = {
  init: function (options) {
    this.data = options.data;
    this.onsaved = options.onsaved;
    this.oncancelled = options.oncancelled;

    this.collectionTitle = document.getElementById('collection-title');
    this.collectionTitle.value = this.data.name || '';
    
    this.cancelButton = document.getElementById('cancel-button');
    this.cancelButton.addEventListener('click', this.close.bind(this));

    this.saveButton = document.getElementById('done-button');
    this.saveListener = this.save.bind(this);
    this.saveButton.addEventListener('click', this.saveListener);

    this.form = document.querySelector('form');
    this.form.addEventListener('input', this._checkDoneButton.bind(this));
    
    this.clearButton = document.getElementById('collection-title-clear');
    this.clearButton.addEventListener('touchstart',
                                       this._clearTitle.bind(this));

    // We're appending new elements to DOM so to make sure headers are
    // properly resized and centered, we emmit a lazyload event.
    // This will be removed when the gaia-header web component lands.
    window.dispatchEvent(new CustomEvent('lazyload', {
      detail: document.body
    }));
  },

  close: function() {
    this.oncancelled();
  },

  _clearTitle: function(event) {
    event.preventDefault();
    this.collectionTitle.value = '';
    this._checkDoneButton();
  },

  _checkDoneButton: function() {
    // If name ﬁeld is blank, the “Done” button should be dimmed and inactive
    var title = this.collectionTitle.value.trim();
    this.saveButton.disabled = title === '';
  },

  save: function() {
    this.saveButton.removeEventListener('click', this.saveListener);
    this.data.name = this.collectionTitle.value;
    var collection = BaseCollection.create(this.data);
    collection.write().then(() => this.onsaved());
  }
};
