'use strict';

requireApp('homescreen/test/unit/mock_save_bookmark.html.js');
requireApp('homescreen/js/grid_components.js');
requireApp('homescreen/js/bookmark.js');

requireApp('homescreen/js/bookmark_editor.js');

suite('bookmark_editor.js >', function() {

  var wrapperNode;

  suiteSetup(function() {
    wrapperNode = document.createElement('section');
    wrapperNode.innerHTML = MockSaveBookmarkHtml;
    document.body.appendChild(wrapperNode);
  });

  suiteTeardown(function() {
    document.body.removeChild(wrapperNode);
  });

  suite('BookmarkEditor >', function() {

    suiteSetup(function() {
      BookmarkEditor.init({
        data: {
          name: 'Mozilla',
          url: 'http://www.mozilla.org/es-ES/firefox/new/'
        },
        onsaved: function() { },
        oncancelled: function() { }
      });
    });

    test('The title has to be defined from options.data.name >', function() {
      assert.equal(document.getElementById('bookmark-title').value,
                   'Mozilla');
    });

    test('The URL has to be defined from options.data.url >', function() {
      assert.equal(document.getElementById('bookmark-url').value,
                   'http://www.mozilla.org/es-ES/firefox/new/');
    });

  });

});
