//==============================================================================
// Dragon Engine (D$E) Ring Menu Party
// D$E_RingMenuParty.js
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
 *@plugindesc Used for any ring menu scene than requires an actor window.
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

D$E.ensureParameters('D$E_RingMenuParty');

PluginManager.register("D$E_RingMenuParty", "1.0.0", {
	"email": "ramiro.rojo.cretta@gmail.com",
	"website": "http://binarychest.wordpress.com",
	"name": "Ramiro Rojo"
}, "2015-11-04");



(function ($) {
  "use strict";
  if (!$.ui || !$.ui.RingMenu) {
    throw "The  Ring Menu Party with a ring menu requires the Ring menu (D$E_RingSceneMenu) to work!";
  }
  var RingMenu = $.ui.RingMenu;
  var params = RingMenu.readParams('D$E_RingMenuParty');

  $.ui.RingMenu.Party = $.ui.RingMenu.extend();

  $.ui.RingMenu.Party.prototype.initialize = function(parent) {
      this.parent = parent;
      $.ui.RingMenu.prototype.initialize.call(this, params.make());
      this.close(0);
      this._drawCommands();
      this._active = false;
      this._formationMode = false;
  }

  MVC.accessor(Window_MenuStatus.prototype, 'formationMode');

  $.ui.RingMenu.Party.prototype._drawCommands = function () {
    var self = this;
    $gameParty.members().forEach(function (member, i) {
      self.addCommand(member.name, i, true);
    });
    this.addCancelCommand();
  }

  $.ui.RingMenu.Party.prototype._createButton = function (text, name, enabled, icon) {
    return new $.ui.RingMenu.Party.Button(this, name);
  }

  $.ui.RingMenu.Party.prototype._refresh = function () {

  }

  $.ui.RingMenu.Party.prototype.refresh = function () {

  };

  $.ui.RingMenu.Party.prototype.setFormationMode = function (formationMode) {
    this._formationMode = formationMode;
  }

  $.ui.RingMenu.Party.prototype.selectLast = function () {
    this.select($gameParty.menuActor().index() || 0);
  }

  $.ui.RingMenu.Party.prototype.processOk = function () {
    var member = $gameParty.members()[this.index()];
    if (member) {
      $gameParty.setMenuActor(member);
    }
    $.ui.RingMenu.prototype.processOk.call(this);
  }

  // Button
  $.ui.RingMenu.Party.Button = $.ui.RingMenu.Button.extend();

  $.ui.RingMenu.Party.Button.prototype._updateIconBitmap = function () {
    var pw, ph, sx, sy;
    var icon = $gameParty.members()[this._menu.indexOf(this._name) ];
    if (icon == this._lastIcon) {
      return;
    }
    this._lastIcon = icon;
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    var bitmap = ImageManager.loadCharacter(icon.characterName());
    var big = ImageManager.isBigCharacter(icon.characterName());
    pw = bitmap.width / (big ? 3 : 12);
    ph = bitmap.height / (big ? 4 : 8);
    var n = icon.characterIndex();
    sx = (n % 4 * 3 + 1) * pw;
    sy = (Math.floor(n / 4) * 4) * ph;
    this.bitmap = bitmap;
    this.setColdFrame(sx, sy, pw, ph * 3 / 4);
  };

  $.PARAMETERS['RingMenuParty'] = params;

})(D$E);
