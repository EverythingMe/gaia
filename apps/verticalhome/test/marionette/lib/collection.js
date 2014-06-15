'use strict';
/* global module */

var Actions = require('marionette-client').Actions;

function Collection(client, server) {
  this.client = client;
  this.server = server;
  this.actions = new Actions(client);
}

/**
 * @type String Origin of Collection app
 */
Collection.URL = 'app://collection.gaiamobile.org';

Collection.Selectors = {
  contextMenuTarget: '#icons',
  menuAddButton: '#create-smart-collection',
  systemSelectConfirm: '#select-options-buttons button.value-option-confirm'
};

Collection.prototype = {

  /**
   * Enters the create collection screen from the homescreen.
   */
  enterCreateScreen: function() {
    var selectors = Collection.Selectors;
    var container = this.client.helper.waitForElement(
      selectors.contextMenuTarget);
    this.actions.longPress(container, 1).perform();

    this.client.helper.waitForElement(selectors.menuAddButton).click();
  },

  /**
   * Selects a collection by positions in the list.
   * @return {Array} An array of item names.
   */
  selectNew: function() {
    var allNames = [];
    for (var i = 0, iLen = arguments.length; i < iLen; i++) {
      var index = arguments[i];
      var listItem = this.client.helper.waitForElement(
        '#select-option-popup ol li[data-option-index="' + index + '"]');
      allNames.push(listItem.text());
      listItem.click();
    }
    this.client.helper.waitForElement(Collection.Selectors.systemSelectConfirm)
        .click();
    return allNames;
  },

  /**
   * Verifies that a collection exists by name.
   * @return {Element} The collection icon.
   */
  getCollectionByName: function(name) {
    var icons = this.client.findElements('body .icon');
    for (var i = 0, iLen = icons.length; i < iLen; i++) {
      if (icons[i].text() === name) {
        return true;
      }
    }
    throw new Error('Could not find the collection ' + name);
  }
};

module.exports = Collection;
