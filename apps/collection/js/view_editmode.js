'use strict';

(function(exports) {

  var elements = {
    grid: document.getElementById('grid'),
    done: document.getElementById('exit-edit-mode')
  };

  function ViewEditMode(collection) {
    this.collection = collection;

    window.addEventListener('hashchange', this);
    window.addEventListener('gaiagrid-editmode-end', this);

    elements.done.addEventListener('click', this.exitEditMode);
  }

  ViewEditMode.prototype = {

    /**
     * Called when we press 'Done' to exit edit mode.
     * Fires a custom event to use the same path as pressing the home button.
     */
    exitEditMode: function(e) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('hashchange'));
    },

    handleEvent: function(e) {
      var grid = elements.grid;

      switch(e.type) {
        case 'gaiagrid-editmode-end':
          // save new sorting
          console.log(grid.getItems());

          // render collection with webResults
          // this.collection.render(grid);
          break;

        case 'hashchange':
          // home button or "done" clicked
          if (grid._grid.dragdrop.inEditMode) {
            grid._grid.dragdrop.exitEditMode();
            return;
          }
          break;
      }
    }
  };

  exports.ViewEditMode = ViewEditMode;

}(window));
