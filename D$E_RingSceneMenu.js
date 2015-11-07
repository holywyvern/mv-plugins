//==============================================================================
// Dragon Engine (D$E) Ring Scene Menu
// D$E_RingSceneMenu.js
// Version 1.0.0
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

  Scene_Menu.prototype.createCommandWindow = function() {
      this._commandWindow = new Window_MenuCommand(this._windowLayer);
      this.addWindow(this._commandWindow);
      this._commandWindow.setHandler('item',      this._prepareMenu(this.commandItem));
      this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
      this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
      this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
      this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
      this._commandWindow.setHandler('options',   this._prepareMenu(this.commandOptions));
      this._commandWindow.setHandler('save',      this._prepareMenu(this.commandSave));
      this._commandWindow.setHandler('gameEnd',   this._prepareMenu(this.commandGameEnd));
      this._commandWindow.setHandler('cancel',   this.popScene.bind(this));

  };

  Scene_Menu.prototype._prepareMenu = function (action) {
    var self = this;
    return function () {
      self._sceneDied = true;
      self._sceenDieAction =  action.bind(self);
    };
  }

  var oldScene_Menu_popScene     = Scene_Menu.prototype.popScene;
  var oldScene_Menu_update       = Scene_Menu.prototype.update;
  var oldScene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;

  Scene_Menu.prototype.popScene = function () {
    this._commandWindow.close();
    this._sceneDied = true;
    this._sceenDieAction = oldScene_Menu_popScene.bind(this);
  }

  Scene_Menu.prototype.onPersonalOk = function() {
    this._commandWindow.close();
    this._sceneDied = true;
    this._sceenDieAction = oldScene_Menu_onPersonalOk.bind(this);
  };

  Scene_Menu.prototype.update = function () {
    if (this._sceneDied) {
      if (!this._commandWindow.isAnimating()) {
        this._sceenDieAction();
        this._sceneDied = false;
        return;
      }
    }
    oldScene_Menu_update.apply(this, arguments);
  }

  Scene_Menu.prototype.createStatusWindow = function() {
      this._statusWindow = new $.ui.RingMenu.Party(this._windowLayer);
      this.addWindow(this._statusWindow);
  };

  $.PARAMETERS['RingSceneMenu'] = params;

})(D$E);
