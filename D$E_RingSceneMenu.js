//==============================================================================
// Dragon Engine (D$E) Ring Scene Menu
// D$E_RingSceneMenu.js
// Version 1.2.1
//==============================================================================
/*
 * Copyright 2015 Ramiro Rojo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *    http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*:
 *@plugindesc Replaces the current scene
 *
 * @param Icons
 * @desc The set of icon used by the ring menu.
 * The list is in the format name: icon1, name2: icon2, ...
 * @default item: 176, skill: 79, equip: 137, status: 82, formation: 75, options: 83, save: 84, gameEnd: 1, cancel: 74
 *
 * @param Centre X
 * @desc The x position to display the centre of the menu.
 * Default: $gamePlayer.screenX()
 * @default $gamePlayer.screenX()
 *
 * @param Centre Y
 * @desc The y position to display the centre of the menu.
 * Default: $gamePlayer.screenY() - ($gamePlayer.isInAirship() ? 48 : 16)
 * @default $gamePlayer.screenY() - ($gamePlayer.isInAirship() ? 48 : 16)
 *
 * @param Radius X
 * @desc The x radius of the menu.
 * Default: Graphics.boxWidth / 10
 * @default Graphics.boxWidth / 10
 *
 * @param Radius Y
 * @desc The y radius of the menu.
 * Default: 32
 * @default 32
 * *
 * @param Starting Angle
 * @desc The starting angle of the first element, in degrees
 * Default: -90
 * @default -90
 *
 * @param Rotation
 * @desc 1- to clockwise, 1 to counter clockwise
 * Default: -1
 * @default -1
 *
 * @param Scale Difference
 * @desc Reduction / Increment for y values when rotating for 3d effect.
 * Default: 0.2
 * @default 0.2
 *
 * @param Show Actor Sprite
 * @desc Handles if the actor should be shown at the middle of the menu.
 * Default: yes
 * @default yes
 *
 * @param Show help window
 * @desc Select if you want to display the help window or not.
 * Default: yes.
 * @default yes
 *
 * @param Help Window X
 * @desc The default x position of the help window
 * Default: $gamePlayer.screenX() - 96
 * @default $gamePlayer.screenX() - 96
 *
 * @param Help Window Y
 * @desc The default y position of the help window
 * Default: $gamePlayer.screenY() - ($gamePlayer.isInAirship() ? 48 : 16) + 32
 * @default $gamePlayer.screenY() - ($gamePlayer.isInAirship() ? 48 : 16) + 32
 *
 * @param Help Window width
 * @desc The default width of the help window
 * Default: 320
 * @default 320
 *
 * @param Help Window height
 * @desc The default height of the help window
 * Default: 72
 * @default 72
 *
 * @param Help Window background opacity
 * @desc The opacity of the background for help window. o is transparent,
 * 255 means completely opaque. Default: 0
 * @default 0
 *
 * @help
 * =============================================================================
 * * FAQ
 * =============================================================================
 * - It is not working!
 *   Press F8, check the console, it usually gives you a nice formatted error
 *   made by me.
 *   If it doesn't then report please!
 * ---------------------------------------------------------------------------
 * - Can I use images instead of the iconset?
 *   Yes! you can, instead of putting a number, put it as a name like:
 *   item: My Awesome Name.
 *   Be aware than spaces before and after your name WILL be ignored
 *   So 'My Awesome name' is the same as 'My Awesome name   ' (notice the spaces
 *   at the end) And remeber to not put the name with ''.
 * ---------------------------------------------------------------------------
 */
if (!window.D$E) {
  throw new Error("This plugin requires the 'Dragon Engine (D$E)' to work properly! Ensure your plugin list, or order of plugins.");
}

D$E.ensureParameters('D$E_RingSceneMenu');

PluginManager.register("D$E_RingSceneMenu", "1.0.0", {
	"email": "ramiro.rojo.cretta@gmail.com",
	"website": "http://binarychest.wordpress.com",
	"name": "Ramiro Rojo"
}, "2015-11-04");



(function ($) {
  "use strict";
  if (!$.ui || !$.ui.RingMenu) {
    throw "The Scene Menu with a ring menu requires the Ring menu (D$E_RingSceneMenu) to work!";
  }

  if (!$.PARAMETERS['RingMenuParty']) {
    throw "The Scene Menu with a ring menu requires the Ring menu for the party (D$E_RingMenuParty) to work!";
  }

  var RingMenu = $.ui.RingMenu;
  var params = RingMenu.readParams('D$E_RingSceneMenu');

  $.PARAMETERS['RingSceneMenu'] = params;

  // Replacing the menu command itself.
  Window_MenuCommand = $.ui.RingMenu.extend();

  Window_MenuCommand.prototype.initialize = function(parent) {
    this.parent = parent;
      $.ui.RingMenu.prototype.initialize.call(this, params.make());
      this.makeCommandList();
      this.selectLast();
      this.close(0);
      this.open(30);
  };

  Window_MenuCommand._lastCommandSymbol = null;

  Window_MenuCommand.initCommandPosition = function() {
      this._lastCommandSymbol = null;
  };

  Window_MenuCommand.prototype.makeCommandList = function() {
      this.addMainCommands();
      this.addFormationCommand();
      this.addOriginalCommands();
      this.addOptionsCommand();
      this.addSaveCommand();
      this.addGameEndCommand();
      this.addCancelCommand();
  };

  Window_MenuCommand.prototype.addMainCommands = function() {
      var enabled = this.areMainCommandsEnabled();
      if (this.needsCommand('item')) {
          this.addCommand(TextManager.item, 'item', enabled);
      }
      if (this.needsCommand('skill')) {
          this.addCommand(TextManager.skill, 'skill', enabled);
      }
      if (this.needsCommand('equip')) {
          this.addCommand(TextManager.equip, 'equip', enabled);
      }
      if (this.needsCommand('status')) {
          this.addCommand(TextManager.status, 'status', enabled);
      }
  };

  Window_MenuCommand.prototype.addFormationCommand = function() {
      if (this.needsCommand('formation')) {
          var enabled = this.isFormationEnabled();
          this.addCommand(TextManager.formation, 'formation', enabled);
      }
  };

  Window_MenuCommand.prototype.addOriginalCommands = function() {
  };

  Window_MenuCommand.prototype.addOptionsCommand = function() {
      if (this.needsCommand('options')) {
          var enabled = this.isOptionsEnabled();
          this.addCommand(TextManager.options, 'options', enabled);
      }
  };

  Window_MenuCommand.prototype.addSaveCommand = function() {
      if (this.needsCommand('save')) {
          var enabled = this.isSaveEnabled();
          this.addCommand(TextManager.save, 'save', enabled);
      }
  };

  Window_MenuCommand.prototype.addGameEndCommand = function() {
      var enabled = this.isGameEndEnabled();
      this.addCommand(TextManager.gameEnd, 'gameEnd', enabled);
  };

  Window_MenuCommand.prototype.needsCommand = function(name) {
      var flags = $dataSystem.menuCommands;
      if (flags) {
          switch (name) {
          case 'item':
              return flags[0];
          case 'skill':
              return flags[1];
          case 'equip':
              return flags[2];
          case 'status':
              return flags[3];
          case 'formation':
              return flags[4];
          case 'save':
              return flags[5];
          }
      }
      return true;
  };

  Window_MenuCommand.prototype.areMainCommandsEnabled = function() {
      return $gameParty.exists();
  };

  Window_MenuCommand.prototype.isFormationEnabled = function() {
      return $gameParty.size() >= 2 && $gameSystem.isFormationEnabled();
  };

  Window_MenuCommand.prototype.isOptionsEnabled = function() {
      return true;
  };

  Window_MenuCommand.prototype.isSaveEnabled = function() {
      return !DataManager.isEventTest() && $gameSystem.isSaveEnabled();
  };

  Window_MenuCommand.prototype.isGameEndEnabled = function() {
      return true;
  };

  Window_MenuCommand.prototype.processOk = function() {
      Window_MenuCommand._lastCommandSymbol = this.currentSymbol();
      RingMenu.prototype.processOk.call(this);
  };

  Window_MenuCommand.prototype.selectLast = function() {
      this.selectSymbol(Window_MenuCommand._lastCommandSymbol);
  };

  Window_MenuCommand.__inverseStart = false;

  Scene_Menu.__startAtActorSelection = false;

  Scene_Menu.prototype.createCommandWindow = function() {
      this._commandWindow = new Window_MenuCommand(this._windowLayer);
      this.addWindow(this._commandWindow);
      this._commandWindow.setHandler('item',      this._prepareMenu(this.commandItem));
      this._commandWindow.setHandler('skill',     this._prepareMenu(this.commandPersonal, true));
      this._commandWindow.setHandler('equip',     this._prepareMenu(this.commandPersonal, true));
      this._commandWindow.setHandler('status',    this._prepareMenu(this.commandPersonal, true));
      this._commandWindow.setHandler('formation', this._prepareMenu(this.commandFormation, true));
      this._commandWindow.setHandler('options',   this._prepareMenu(this.commandOptions));
      this._commandWindow.setHandler('save',      this._prepareMenu(this.commandSave));
      this._commandWindow.setHandler('gameEnd',   this._prepareMenu(this.commandGameEnd));
      this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
      if (Window_MenuCommand.__inverseStart) {
        this._commandWindow.inverseClose(0);
        if (!Scene_Menu.__startAtActorSelection) {
          this._commandWindow.open();
        }
        Window_MenuCommand.__inverseStart = false;
      }
  };

  Scene_Menu.prototype.createStatusWindow = function() {
      this._statusWindow = new $.ui.RingMenu.Party(this._windowLayer);
      this.addWindow(this._statusWindow);
      if (Scene_Menu.__startAtActorSelection) {
        Scene_Menu.__startAtActorSelection = false;
        this._commandWindow.deactivate();
        this._statusWindow.activate();
        this._statusWindow.inverseClose(0);
        this._statusWindow.open();
        this.bindStatus();
      }
  }

  Scene_Menu.prototype._prepareMenu = function (action, openStatus) {
    var self = this;
    return function () {
      self._commandWindow.inverseClose();
      Window_MenuCommand.__inverseStart = true;
      if (openStatus) self._statusWindow.open();
      self._sceneDied = true;
      self._sceneDieAction =  action.bind(self);
    };
  }

  var oldScene_Menu_popScene          = Scene_Menu.prototype.popScene;
  var oldScene_Menu_update            = Scene_Menu.prototype.update;
  var oldScene_Menu_onPersonalOk      = Scene_Menu.prototype.onPersonalOk;
  var oldScene_Menu_onPersonalCancel  = Scene_Menu.prototype.onPersonalCancel;
  var oldScene_Menu_create            = Scene_Menu.prototype.create;
  var oldScene_Menu_onFormationCancel = Scene_Menu.prototype.onFormationCancel;

  Scene_Menu.prototype.popScene = function () {
    this._commandWindow.close();
    this._sceneDied = true;
    this._sceneDieAction = oldScene_Menu_popScene.bind(this);
  }

  Scene_Menu.prototype.isPersonalCommand = function () {
    switch (this._commandWindow.currentSymbol()) {
      case 'skill': case 'equip': case 'formation': case 'status':
        return true;
      default:
        break;
    }
    return false;
  }

  Scene_Menu.prototype.bindStatus = function () {
    if (this.isPersonalCommand()) {
      this._bindPersonal();
    } else {
      this._bindFormation();
    }
  }

  Scene_Menu.prototype._bindPersonal = function() {
      this._statusWindow.setHandler('ok',     this.onPersonalOk.bind(this));
      this._statusWindow.setHandler('cancel', this.onPersonalCancel.bind(this));
  };

  Scene_Menu.prototype._bindFormation = function() {
      this._statusWindow.setHandler('ok',     this.onFormationOk.bind(this));
      this._statusWindow.setHandler('cancel', this.onFormationCancel.bind(this));
  };

  Scene_Menu.prototype.onPersonalCancel = function () {
    console.log('a');
    this._statusWindow.close();
    this._commandWindow.inverseClose(0);
    this._commandWindow.selectLast();
    this._commandWindow.open();
    this._commandWindow.activate();
    this._sceneDied = true;
    this._sceneDieAction = oldScene_Menu_onPersonalCancel.bind(this);
  }

  Scene_Menu.prototype.onPersonalOk = function() {
    this._sceneDied = true;
    Scene_Menu.__startAtActorSelection = true;
    Window_MenuCommand.__inverseStart = true;
    this._statusWindow.inverseClose();
    this._sceneDieAction = oldScene_Menu_onPersonalOk.bind(this);
  };

  Scene_Menu.prototype.update = function () {
    if (this._sceneDied) {
      if (this.canCallDieAnimation()) {
        this._sceneDieAction();
        this._sceneDied = false;
        return;
      }
    }
    oldScene_Menu_update.apply(this, arguments);
  }

  Scene_Menu.prototype.canCallDieAnimation = function () {
    return !this._commandWindow.isAnimating() && !this._statusWindow.isAnimating();
  }

  Scene_Menu.prototype.create = function() {
      oldScene_Menu_create.call(this);
      this.createHelpWindow();
  }

  Scene_Menu.prototype.createHelpWindow = function () {
    if (params.showHelpWindow) {
      this._helpWindow = new Window_Help(1);
      this.addWindow(this._helpWindow);
      this._commandWindow.setHelpWindow(this._helpWindow);
      this._statusWindow.setHelpWindow(this._helpWindow);
      var rect = params.helpWindowRect();
      this._helpWindow.move(rect.x, rect.y, rect.width, rect.height);
      this._helpWindow.opacity = params.helpWindowOpacity();
    }
  }

  Scene_Menu.prototype.onFormationCancel = function() {
    oldScene_Menu_onFormationCancel.call(this);
    this._statusWindow.close();
    this._commandWindow.open();
    this._sceneDied = true;
    this._sceneDieAction = this._statusWindow.selectLast.bind(this._statusWindow);
  };

  $.PARAMETERS['RingSceneMenu'] = params;

})(D$E);
