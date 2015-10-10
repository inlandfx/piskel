(function () {
  var ns = $.namespace('pskl.controller.dialogs');

  ns.CheatsheetController = function () {
    this.shortcuts = pskl.service.keyboard.Shortcuts;
  };

  pskl.utils.inherit(ns.CheatsheetController, ns.AbstractDialogController);

  ns.CheatsheetController.prototype.init = function () {
    this.cheatsheetEl = document.getElementById('cheatsheetContainer');
    if (!this.cheatsheetEl) {
      throw 'cheatsheetEl DOM element could not be retrieved';
    }

    pskl.utils.Event.addEventListener(this.cheatsheetEl, 'click', this.onCheatsheetClick_, this);
    $.subscribe(Events.SHORTCUTS_CHANGED, this.onShortcutsChanged_.bind(this));

    this.initMarkup_();
  };

  ns.CheatsheetController.prototype.onShortcutsChanged_ = function () {
    this.initMarkup_();
  };

  ns.CheatsheetController.prototype.onCheatsheetClick_ = function (evt) {
    var shortcutId = pskl.utils.Dom.getData(evt.target, 'shortcutId');
    if (!shortcutId) {
      return;
    }

    var shortcut = pskl.service.keyboard.Shortcuts.getShortcutById(shortcutId);
    var newKeys = window.prompt('Please enter the new key', shortcut.getKeys().join(', '));
    shortcut.updateKeys(newKeys);
  };

  ns.CheatsheetController.prototype.initMarkup_ = function () {
    this.initMarkupForTools_();
    this.initMarkupForMisc_();
    this.initMarkupForColors_();
    this.initMarkupForSelection_();
  };

  ns.CheatsheetController.prototype.initMarkupForTools_ = function () {
    var descriptors = this.createShortcutDescriptors_(this.shortcuts.TOOL, this.getToolShortcutClassname_);
    this.initMarkupForDescriptors_(descriptors, '.cheatsheet-tool-shortcuts');
  };

  ns.CheatsheetController.prototype.getToolShortcutClassname_ = function (shortcut) {
    return 'tool-icon ' + shortcut.getId();
  };

  ns.CheatsheetController.prototype.initMarkupForMisc_ = function () {
    var descriptors = this.createShortcutDescriptors_(this.shortcuts.MISC);
    this.initMarkupForDescriptors_(descriptors, '.cheatsheet-misc-shortcuts');
  };

  ns.CheatsheetController.prototype.initMarkupForColors_ = function () {
    var descriptors = this.createShortcutDescriptors_(this.shortcuts.COLOR);
    this.initMarkupForDescriptors_(descriptors, '.cheatsheet-colors-shortcuts');
  };

  ns.CheatsheetController.prototype.initMarkupForSelection_ = function () {
    var descriptors = this.createShortcutDescriptors_(this.shortcuts.SELECTION);
    this.initMarkupForDescriptors_(descriptors, '.cheatsheet-selection-shortcuts');
  };

  ns.CheatsheetController.prototype.createShortcutDescriptors_ = function (shortcutMap, classnameProvider) {
    return Object.keys(shortcutMap).map(function (shortcutKey) {
      var shortcut = shortcutMap[shortcutKey];
      var classname = typeof classnameProvider == 'function' ? classnameProvider(shortcut) : '';
      return this.toDescriptor_(shortcut, classname);
    }.bind(this));
  };

  ns.CheatsheetController.prototype.toDescriptor_ = function (shortcut, icon) {
    var key = shortcut.getKey();
    if (pskl.utils.UserAgent.isMac) {
      key = key.replace('ctrl', 'cmd');
    }
    key = key.replace('up', '&#65514;');
    key = key.replace('down', '&#65516;');
    key = key.replace(/>/g, '&gt;');
    key = key.replace(/</g, '&lt;');
    key = key.replace(/^(.*[^ ])\+([^ ].*)$/g, '$1 + $2');

    return {
      'key' : key,
      'id' : shortcut.getId(),
      'description' : shortcut.getDescription(),
      'icon' : icon
    };
  };

  ns.CheatsheetController.prototype.initMarkupForDescriptors_ = function (descriptors, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) {
      return;
    }
    var markupArray = descriptors.map(this.getMarkupForDescriptor_);
    container.innerHTML = markupArray.join('');
  };

  ns.CheatsheetController.prototype.getMarkupForDescriptor_ = function (descriptor) {
    var shortcutTemplate = pskl.utils.Template.get('cheatsheet-shortcut-template');
    var markup = pskl.utils.Template.replace(shortcutTemplate, {
      shortcutId : descriptor.id,
      shortcutIcon : descriptor.icon,
      shortcutDescription : descriptor.description,
      shortcutKey : descriptor.key
    });

    return markup;
  };
})();
