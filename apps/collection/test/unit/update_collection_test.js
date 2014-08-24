'use strict';

/* global loadBodyHTML, CollectionEditor, BaseCollection */
/* global requireApp, require, suite, suiteTeardown, suiteSetup, test, assert,
          sinon */

require('/shared/test/unit/load_body_html_helper.js');

requireApp('collection/js/common.js');
requireApp('collection/js/objects.js');
requireApp('collection/js/update_collection.js');

suite('update_collection.js >', function() {

  var name = 'Enjoy';

  var collection = {
    id: 134,
    name: name
  };

  suiteSetup(function() {
    loadBodyHTML('/update.html');
  });

  suiteTeardown(function() {
    document.body.innerHTML = '';
  });

  function noop() {
    // Do nothing
  }

  function dispatchInputEvent() {
    CollectionEditor.form.dispatchEvent(new CustomEvent('input'));
  }

  suite('UI initialized correctly >', function() {
    suiteSetup(function() {
      CollectionEditor.init({
        data: collection
      });
    });

    test('The title was defined accordingly >', function() {
      assert.equal(CollectionEditor.collectionTitle.value, name);
    });

    test('"done" button is disabled initially', function() {
      assert.isTrue(CollectionEditor.saveButton.disabled);
    });
  });

  suite('Checking "done" button >', function() {

    suiteSetup(function() {
      CollectionEditor.init({
        data: collection
      });
    });

    test('Typing collection name ', function() {
      CollectionEditor.collectionTitle.value = 'Telefonica';
      dispatchInputEvent();
      assert.isFalse(CollectionEditor.saveButton.disabled);

      CollectionEditor.collectionTitle.value = '';
      dispatchInputEvent();
      assert.isTrue(CollectionEditor.saveButton.disabled);

      CollectionEditor.collectionTitle.value = name;
      dispatchInputEvent();
      assert.isFalse(CollectionEditor.saveButton.disabled);
    });

  });

  suite('Checking "close" button >', function() {

    test('Cancelling after clicking "close" button ', function(done) {
      CollectionEditor.init({
        data: collection,
        oncancelled: function() {
          this.oncancelled = noop;
          done();
        }
      });

      CollectionEditor.cancelButton.click();
    });

  });

  suite('Saving collection with another name >', function() {
    var expectedName = 'Games',
        stub = null;

    setup(function() {
      stub = sinon.stub(BaseCollection, 'create', function(data) {
        assert.equal(data.id, collection.id);
        assert.equal(data.name, expectedName);
        return {
          write: function() {
            return {
              then: function(resolve, refect) {
                resolve();
              }
            };
          }
        };
      });
    });

    teardown(function() {
      stub.restore();
    });

    test('Updated successfully ', function(done) {
      CollectionEditor.init({
        data: collection,
        onsaved: function() {
          this.onsaved = noop;
          done();
        }
      });

      CollectionEditor.collectionTitle.value = expectedName;
      CollectionEditor.saveButton.click();
    });

  });

});
