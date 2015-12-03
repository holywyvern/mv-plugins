//==============================================================================
// Dragon Engine (D$E) Ring Menu
// D$E_RingMenu.js
// Version 1.5.0
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
 *@plugindesc Allows to use an animated ring menu with options.
 *This is extended by many plugins.
 *
 * @param Cancel Text
 * @desc The text used by the cancel command.
 * Use it as your own language.
 * @default Cancel
 *
 * @param Default Rotation Time
 * @desc The time the ring manu takes to change to the next item in frames.
 * Default: 30
 * @default 30
 *
 */
if (!window.D$E) {
  throw new Error("This plugin requires the 'Dragon Engine (D$E)' to work properly! Ensure your plugin list, or order of plugins.");
}

D$E.ensureParameters('D$E_RingMenu');

PluginManager.register("D$E_RingMenu", "1.0.0", {
	"email": "ramiro.rojo.cretta@gmail.com",
	"website": "http://binarychest.wordpress.com",
	"name": "Ramiro Rojo"
}, "2015-11-04");



(function ($) {
  "use strict";

  var editorParams = $.parametersFromSchema(PluginManager.parameters('D$E_RingMenu'), {
    "Cancel Text": 'string',
    "Default Rotation Time": 'number'
  });

  var params = {
    cancel: editorParams["Cancel Text"],
    defaultTime: editorParams["Default Rotation Time"]
  };

  $.ui = $.ui || {};

  $.ui.RingMenu = MVC.extend(PIXI.Container || PIXI.DisplayObjectContainer);

  $.ui.RingMenu.params = params;



  $.ui.RingMenu.prototype.initialize = function (options) {
    this._handlers = {};
    this._disabled = {};
    this._texts    = {};
    this._commands = options.commands || [];
    this._icons    = options.icons || {};
    this._commandButtons = [];
    if (this.clearCommandList) {
      this.clearCommandList();
      this.drawAllItems();
    }
    this.maxRadius = options.radius || new Point(128, 48);
    this._index = options.index || 0;
    this._helpWindow = null;
    this.startingAngle = options.startingAngle  || 0;
    this._radius = new Point(this.maxRadius.x, this.maxRadius.y);
    this._centre = options.centre || new Point(0, 0);
    this._opacity = 255;
    this._destinationOpacity = this._opacity;
    this._destinationRadius = this._radius;
    this._animationTime = 0;
    this._active = true;
    this.rotation = options.rotation || -1;
    this._angle  = this.startingAngle  * this.rotation;
    this._destinationAngle = this._angle;
    this.scale = options.scale || 0;
    this._targetIndex = this._index;
    this._angle = this._destinationAngle;
    if (options.showActorSprite) {
      var char;
      if ($gamePlayer.isInVehicle()) {
        char = $gamePlayer.vehicle();
      } else {
        char = $gamePlayer;
      }
      this._actorSprite = new Sprite_Character(char);
      if (this.parent.addChild) {
        this.parent.addChild(this._actorSprite);
      }
    }
  };

  MVC.accessor($.ui.RingMenu.prototype, 'opacity',
    function (value) {
      this._opacity = Math.max(0, Math.min(value, 255));
    }
  );


  MVC.reader($.ui.RingMenu.prototype, 'angle');

  MVC.reader($.ui.RingMenu.prototype, 'length',
    function () {
      return Object.keys(this._commands).length;
    }
  );

  MVC.reader($.ui.RingMenu.prototype, 'radius',
    function () {
      return this._radius;
    }
  );

  MVC.reader($.ui.RingMenu.prototype, 'centre',
    function () {
      return this._centre;
    }
  );

  MVC.accessor($.ui.RingMenu.prototype, 'command',
    function (value) {
      this.select(this.indexOf(value));
    },
    function () {
      return this._commandsByIndex[this.index()];
    }
  );

  $.ui.RingMenu.prototype.index = function () {
    return this._index;
  }

  $.ui.RingMenu.prototype.deselect = function () {
    this.close();
  }

  $.ui.RingMenu.prototype.helpWindow = function () {
    return this._helpWindow;
  }

  $.ui.RingMenu.prototype.setHelpWindow = function (window) {
    this._helpWindow = window;
  }

  $.ui.RingMenu.prototype.addCancelCommand = function () {
    var txt = $.ui.RingMenu.params.cancel;
    var cmd = new $.ui.RingMenu.Button(this, 'cancel');
    this._setupCommand(cmd, txt, 'cancel', true);
  }

  $.ui.RingMenu.prototype.clearCommandList = function () {
    this._commandsByIndex = [];
    var self = this;
    this._commandButtons.forEach(function (i) {
      self.parent.removeChild(i);
    });
    this._commandButtons = [];
  };

  $.ui.RingMenu.prototype.redrawItem = function (index) {
    this._commandButtons[index].redraw();
  }

  $.ui.RingMenu.prototype._refresh = function () {
    this.clearCommandList();
    this.drawAllItems();
  }

  $.ui.RingMenu.prototype.refresh = function () {
    this._refresh();
  };

  $.ui.RingMenu.prototype.iconOf = function (handler) {
    return this._icons[handler];
  }

  $.ui.RingMenu.prototype.indexOf = function (handler) {
    return this._commandsByIndex.indexOf(handler);
  };

  $.ui.RingMenu.prototype.setHandler = function (name, callback) {
    var idx = this.indexOf(name);
    this._handlers[name] = callback;
    if (idx >= 0) {
      this._commandButtons[idx].setClickHandler = callback;
    }
  };

  $.ui.RingMenu.prototype.select = function (idx) {
    if (idx >= 0) {
      this._index = idx;
      this._angle = this._angleFor(this.index());
      this._targetIndex = this.index();
      this._destinationAngle = this._angle;
    }
  };

  $.ui.RingMenu.prototype.selectSymbol = function (handler) {
    this.select(this.indexOf(handler));
  };

  $.ui.RingMenu.prototype.isOpen = function () {
    return this._radius.x == this._destinationRadius.x && this._radius.y == this._destinationRadius.y;
  };

  $.ui.RingMenu.prototype.isAnimating = function () {
    return this._animationTime > 0;
  };

  $.ui.RingMenu.prototype.isHandled = function (name) {
    return this._handlers[name];
  };

  $.ui.RingMenu.prototype.isActive = function (name) {
    return this._active;
  };

  $.ui.RingMenu.prototype.canProcessInput = function () {
    return this.isOpenAndActive() && (!this.isAnimating());
  };

  $.ui.RingMenu.prototype.isEnabled = function (symbol) {
    return !this._disabled[symbol];
  }

  $.ui.RingMenu.prototype.isEnabled = function () {
    return this.isOpen() && this.isActive();
  }

  $.ui.RingMenu.prototype.isOpenAndActive = function () {
    return this.isOpen() && this.isActive();
  }

  $.ui.RingMenu.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this.command);
  };

  $.ui.RingMenu.prototype.addCommand = function (text, name, enabled, icon) {
    if (typeof icon != 'undefined') {
      this._icons[name] = icon;
    }
    var cmd = this._createButton.apply(this, arguments);
    this._setupCommand(cmd, text, name, enabled, icon || undefined);
  };

  $.ui.RingMenu.prototype._setupCommand = function (cmd, text, name, enabled) {
    cmd.setClickHandler(this._handlers[name]);
    this._texts[name] = text;
    this._commands[name] = cmd;
    this._commandButtons.push(cmd);
    this._commandsByIndex.push(name);
    this._disabled[name] = !enabled;
    this.parent.addChild(cmd);
    this.parent.children.sort(this.sort);
    this._angle = this._angleFor(this._index);
  }

  $.ui.RingMenu.prototype._createButton = function (text, name, enabled, icon) {
    return new $.ui.RingMenu.Button(this, name);
  }

  $.ui.RingMenu.prototype.currentSymbol = function () {
    var l = this._commandsByIndex[this.index()];
    return l;
  }

  $.ui.RingMenu.prototype.disableCommand = function (name) {
    this._disabled[name] = true;
  };

  $.ui.RingMenu.prototype.enableCommand = function (name) {
    this._disabled[name] = false;
  };

  $.ui.RingMenu.prototype.deleteCommand = function (name) {
    this._commands[name] = null;
    this.clearCommandList();
    this.drawAllItems();
  };

  $.ui.RingMenu.prototype.clearCommands = function (name) {
    this.clearCommandList();
    this.drawAllItems();
  };

  $.ui.RingMenu.prototype.playOkSound = function() {
      SoundManager.playOk();
  };

  $.ui.RingMenu.prototype.playBuzzerSound = function() {
      SoundManager.playBuzzer();
  };

  $.ui.RingMenu.prototype.callOkHandler = function() {
    if (this.isHandled(this.command)) {
      this.callHandler(this.command);
    } else {
      this.callHandler('ok');
    }
  };

  $.ui.RingMenu.prototype.callCancelHandler = function() {
      this.callHandler('cancel');
  };


  $.ui.RingMenu.prototype.update = function () {
    if (this.isAnimating()) {
      this._updateAnimation();
    } else {
      this._refreshValues();
      this._updateInput();
      this._updateHelpWindow();
    }
    this._updateZIndexes();
  }

  $.ui.RingMenu.prototype._updateHelpWindow = function () {
    if (this._helpWindow && this.canProcessHelp()) {
      this.currentButton().updateHelp(this._helpWindow);
    }
  }

  $.ui.RingMenu.prototype.text = function (symbol) {
    return this._texts[symbol];
  }

  $.ui.RingMenu.prototype.currentButton = function () {
    return this._commandButtons[this.index()];
  }

  $.ui.RingMenu.prototype.canProcessHelp = function () {
    return this.isActive();
  }

  $.ui.RingMenu.prototype.sort = function (a, b) {
    if (isNaN(a.y) || isNaN(b.y) || a.y === null || b.y === null) {
      return 0;
    }
    if (a.y < b.y)
       return -1;
    if (a.y > b.y)
      return 1;
    return 0;
  }

  $.ui.RingMenu.prototype._updateZIndexes = function () {
    if (this.isAnimating()) {
      this.parent.children.sort(this.sort);
    }
  }

  $.ui.RingMenu.prototype._updateAnimation = function () {
      var t = this._animationTime;
      this._animationTime -= 1;
      var t2 = this._animationTime;
      this._opacity  = (this._opacity  * (t2) + this._destinationOpacity)  / t;
      this._angle    = (this._angle    * (t2) + this._destinationAngle)    / t;
      this._radius.x = (this._radius.x * (t2) + this._destinationRadius.x) / t;
      this._radius.y = (this._radius.y * (t2) + this._destinationRadius.y) / t;
  };

  $.ui.RingMenu.prototype._refreshValues = function () {
    this._index = this._targetIndex;
    var a = this._index;
    var b = this.length;
    this._index = (a % b + b) % b;
    this._angle = this._angleFor(this._index);
  }

  $.ui.RingMenu.prototype._updateInput = function () {
    if (!this.canProcessInput()) {
      return;
    }
    if (this.isOkEnabled() && this.isOkTriggered()) {
        this.processOk();
    } else if (this.isCancelEnabled() && this.isCancelTriggered()) {
        this.processCancel();
    } else if (Input.isPressed('left')) {
      this.turnLeft();
    } else if (Input.isPressed('right')) {
      this.turnRight();
    }
  };

  $.ui.RingMenu.prototype.updateInputData = function () {
    Input.update();
    TouchInput.update();
  };

  $.ui.RingMenu.prototype.isOkEnabled = function () {
    return true;
  };

  $.ui.RingMenu.prototype.isOkTriggered = function () {
    return Input.isRepeated('ok');
  };

  $.ui.RingMenu.prototype.isCancelEnabled = function () {
    return true;
  };

  $.ui.RingMenu.prototype.isCancelTriggered = function () {
    return Input.isRepeated('cancel') || TouchInput.isCancelled();
  };

  $.ui.RingMenu.prototype.processOk = function () {
    if (this.isCurrentItemEnabled()) {
      this.playOkSound();
      this.updateInputData();
      this.deactivate();
      this.callOkHandler();
      return;
    }
    this.playBuzzerSound();
  };

  $.ui.RingMenu.prototype.processCancel = function () {
    SoundManager.playCancel();
    this.updateInputData();
    this.deactivate();
    this.callCancelHandler();
  };

  $.ui.RingMenu.prototype.callHandler = function (name) {
    if (this.isHandled(name)) {
      this._handlers[name]();
    }
  };

  $.ui.RingMenu.prototype.activate = function () {
    this._active = true;
  }

  $.ui.RingMenu.prototype.deactivate = function () {
    this._active = false;
  }

  $.ui.RingMenu.prototype.open = function (time) {
    if (arguments.length == 0) {
      time = params.defaultTime;
    }
    this._destinationRadius = this.maxRadius;
    this._destinationOpacity = 255;
    this._destinationAngle = this._angleFor(this.index());
    this._angle =  this._angle + Math.PI * time / 30;
    this._animationTime = 0;
    if (time <= 0) {
      this._opacity = this._destinationOpacity;
      this._radius = this._destinationRadius;
      this._angle = this._destinationAngle;
      return;
    }
    this._animationTime = time;
  };

  $.ui.RingMenu.prototype.close = function (time) {
    if (arguments.length == 0) {
      time = params.defaultTime;
    }
    this._destinationRadius = new Point(0, 0);
    this._destinationOpacity = 0;
    this._destinationAngle = this._angle + Math.PI * time / 30;
    this._animationTime = 0;
    if (time <= 0) {
      this._opacity = this._destinationOpacity;
      this._radius = this._destinationRadius;
      this._angle = this._destinationAngle;
      return;
    }
    this._animationTime = time;
  };


  $.ui.RingMenu.prototype.inverseClose = function (time) {
    if (arguments.length == 0) {
      time = params.defaultTime;
    }
    this._destinationRadius = new Point(this.maxRadius.x * 2, this.maxRadius.y * 2);
    this._destinationOpacity = 0;
    this._destinationAngle = this._angleFor(this.index()) + Math.PI * time / 30;
    this._animationTime = 0;
    if (time <= 0) {
      this._opacity = this._destinationOpacity;
      this._radius = this._destinationRadius;
      this._angle = this._destinationAngle;
      return;
    }
    this._animationTime = time;
  };

  $.ui.RingMenu.prototype.turnTo = function (symbol, time) {
    var newIndex = this.indexOf(symbol);
    var n = this.index() - newIndex;
    if (n == this.length - 1) {
      this._destinationAngle = this._angleFor(this.index() + 1);
    } else if (n == - this.length + 1) {
      this._destinationAngle = this._angleFor(this.index() - 1);
    } else {
      this._destinationAngle = this.angleFor(symbol);
    }
    if (arguments.length == 1) {
      if ((n == this.length - 1) || (n == - this.length + 1) ) {
        time = params.defaultTime;
      } else {
        time = params.defaultTime * Math.abs(n);
      }

    }
    this._animationTime = time;
    SoundManager.playCursor();
    if (time <= 0) {
      this._angle = this._destinationAngle;
    }
    this._targetIndex = newIndex;
  }

  $.ui.RingMenu.prototype.turnLeft = function (time) {
    if (arguments.length == 0) {
      time = params.defaultTime;
    }
    this._animationTime = time;
    this._destinationAngle = this._nextLeftAngle();
    SoundManager.playCursor();
    if (time <= 0) {
      this._angle = this._destinationAngle;
    }
    this._targetIndex = this._index - 1;
  };

  $.ui.RingMenu.prototype.turnRight = function (time) {
    if (arguments.length == 0) {
      time = params.defaultTime;
    }
    SoundManager.playCursor();
    this._animationTime = time;
    this._destinationAngle = this._nextRightAngle();
    if (time <= 0) {
      this._angle = this._destinationAngle;
    }
    this._targetIndex = this._index + 1;
  };

  $.ui.RingMenu.prototype._nextRightAngle = function () {
    return this._angleFor(this.index() + 1);
  };

  $.ui.RingMenu.prototype._nextLeftAngle = function () {
    return this._angleFor(this.index() - 1);
  };

  $.ui.RingMenu.prototype._angleFor = function (index) {
    var length = this.length;
    if (length < 0) {
      return this.startingAngle;
    }
    return (index - this._index) * Math.PI * 2 / length - this.startingAngle;
  };

  $.ui.RingMenu.prototype.angleFor = function (handle) {
    return this._angleFor(this.indexOf(handle));
  };

  $.ui.RingMenu.prototype.drawAllItems = function () {
    var commands = this._commands;
    for (var commandName in commands) {
      if (commands.hasOwnProperty(commandName)) {
        this.drawItem(commandName);
      }
    }
  }

  $.ui.RingMenu.prototype.drawItem = function (commandName) {
    this._commandsByIndex.push(commandName);
    var cmd = this._createButton(this._texts[commandName], commandName, !this._disabled[commandName], this._icons[commandName]);
    cmd.setClickHandler(this._handlers[commandName]);
    this._commandButtons.push(cmd);
    this.parent.addChild(cmd);
    this.parent.children.sort(this.sort);
  }

  $.ui.RingMenu.prototype.resetScroll = function () {
    this.index = 0;
  }

  // Button here

  $.ui.RingMenu.Button = MVC.extend(Sprite_Button);

  $.ui.RingMenu.Button.prototype.initialize = function (menu, name) {
    Sprite_Button.prototype.initialize.call(this);
    this.opacity = 0;
    this._name = name;
    this._menu = menu;
    this._lastIcon = null;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.x = this._menu.centre.x;
    this.y = this._menu.centre.y;
    this._updateIconBitmap();
  };

  MVC.reader($.ui.RingMenu.Button.prototype, 'icon',
    function () {
      return this._menu.iconOf(this._name);
    }
  );

  MVC.reader($.ui.RingMenu.Button.prototype, 'index',
    function () {
      return this._menu.indexOf(this._name);
    }
  );

  $.ui.RingMenu.Button.prototype.update = function () {
    this._updateIconBitmap();
    this._updatePosition();
    //this.processTouch();
    Sprite_Button.prototype.update.call(this);
  };

  $.ui.RingMenu.Button.prototype.isActive = function () {
    return this._menu.isActive();
  }

  $.ui.RingMenu.Button.prototype._updateIconBitmap = function () {
    var pw, ph, sx, sy;
    var icon = this.icon;
    if (icon == this._lastIcon) {
      return;
    }
    switch (typeof icon) {
      case 'number':
        this.bitmap = ImageManager.loadSystem('IconSet');
        pw = Window_Base._iconWidth;
        ph = Window_Base._iconHeight;
        sx = icon % 16 * pw;
        sy = Math.floor(icon / 16) * ph;
        this.setColdFrame(sx, sy, pw, ph);
        this.setHotFrame(sx, sy, pw, ph);
        break;
      case 'string' :
        this.bitmap = ImageManager.loadSystem(icon);
        pw = this.bitmap.width / 2;
        ph = this.bitmap.height;
        sx = 0;
        sy = 0;
        this.setColdFrame(sx, sy, pw, ph);
        this.setHotFrame(sx + pw, sy, pw, ph);
        break;
      default:
        this.bitmap = ImageManager.loadSystem('IconSet');
        pw = Window_Base._iconWidth;
        ph = Window_Base._iconHeight;
        sx = icon.cold % 16 * pw;
        sy = Math.floor(icon.cold / 16) * ph;
        this.setColdFrame(sx, sy, pw, ph);
        pw = Window_Base._iconWidth;
        ph = Window_Base._iconHeight;
        sx = icon.hot % 16 * pw;
        sy = Math.floor(icon.hot / 16) * ph;
        this.setHotFrame(sx, sy, pw, ph);
        break;
    }
    this._lastIcon = icon;
  };

  $.ui.RingMenu.Button.prototype.isButtonTouched = function() {
      var x = this.canvasToLocalX(TouchInput.x);
      var y = this.canvasToLocalY(TouchInput.y);
      var w = this.width * Math.abs(this.scale.x);
      var h = this.height * Math.abs(this.scale.y);
      return x >= 0 && y >= 0 && x < w && y < h;
  };

  $.ui.RingMenu.Button.prototype.canvasToLocalX = function(x) {
      var node = this;
      while (node) {
          x -= node.x;
          node = node.parent;
      }
      return x + this.anchor.x * this.width * Math.abs(this.scale.x);
  };

  $.ui.RingMenu.Button.prototype.canvasToLocalY = function(y) {
      var node = this;
      while (node) {
          y -= node.y;
          node = node.parent;
      }
      return y + this.anchor.y * this.height * Math.abs(this.scale.y);
  };

  $.ui.RingMenu.Button.prototype.callClickHandler = function () {
    if (this._name == this._menu.currentSymbol()) {
      this._menu.processOk();
    } else {
      this._menu.turnTo(this._name);
    }
  }

  $.ui.RingMenu.Button.prototype._updatePosition = function () {
    var angle = this._menu.angleFor(this._name) - this._menu.angle + this._menu.startingAngle;
    var radius = this._menu.radius;
    var centre = this._menu.centre;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.x = centre.x + radius.x * Math.cos(angle);
    this.y = centre.y + radius.y * Math.sin(angle) * this._menu.rotation ;

    this.scale.x = 1.0 + (this.y - centre.y) * this._menu.scale / this._menu.maxRadius.y;
    this.scale.y = this.scale.x;
    this.opacity = this._menu.opacity * (this._menu.isEnabled(this._name) ? 1 : 0.5);
  };

  $.ui.RingMenu.Button.prototype.redraw = function () {

  }

  $.ui.RingMenu.Button.prototype.updateHelp = function (window) {
    window.setText(this._menu.text(this._name));
  }

  // Command Window

  $.ui.RingMenu.Command = $.ui.RingMenu.extend();

  $.ui.RingMenu.Command.prototype.initialize = function(parent, params) {
      this.parent = parent;
      this._ext = {};
      $.ui.RingMenu.prototype.initialize.call(this, params);
      this.makeCommandList();
  }

  $.ui.RingMenu.Command.prototype.commandName = function(index) {
      return this._texts[this.commandSymbol(index)];
  };

  $.ui.RingMenu.Command.prototype.commandSymbol = function(index) {
      return this._commandsByIndex[index];
  };

  $.ui.RingMenu.Command.prototype.commandExt = function(index) {
      return this._ext[this.commandSymbol(index)];
  };

  $.ui.RingMenu.Command.prototype.isCommandEnabled = function(index) {
      return !this._disabled[this.commandSymbol(index)];
  };

  $.ui.RingMenu.Command.prototype.addCommand = function (text, name, enabled, ext, icon) {
    if (typeof ext == 'undefined') {
      ext = null;
    }
    this._ext[name] = icon;
    $.ui.RingMenu.prototype.addCommand.call(this, text, name, enabled, icon || undefined);
  }

    $.ui.RingMenu.Command.prototype.data = function (index) {
    return {
      name: this.commandName(index),
      text: this.commandSymbol(index),
      ext:  this.commandExt(index),
      enabled: this.isCommandEnabled(index)
    };
  }

  $.ui.RingMenu.Command.prototype.currentData = function() {
    return this.index() >= 0 ? this.data(this.index()) : null;
  };

  $.ui.RingMenu.Command.prototype.currentExt = function () {
    return this.index() >= 0 ? this.commandExt(this.index()) : null;
  }

  $.ui.RingMenu.Command.prototype.findSymbol = function (symbol) {
    return this.indexOf(symbol);
  }

  $.ui.RingMenu.Command.prototype.findExt = function (ext) {
    var length = this._commandsByIndex.length;
    for (var i = 0; i < length; ++i) {
      var cmd = this._commandsByIndex[i];
      if (this._ext[cmd] == ext) {
        return i;
      }
    }
    return -1;
  }

  $.ui.RingMenu.Command.prototype.selectExt = function(ext) {
      var index = this.findExt(ext);
      if (index >= 0) {
          this.select(index);
      } else {
          this.select(0);
      }
  };

  // Parameter reader

  $.ui.RingMenu.readParams = function (name, extraParams) {
    var editorParams = $.parametersFromSchema(PluginManager.parameters(name), $.merge({
      "Icons":         { type:'hash', of: { type:'str', after:  $.parseAsStringOrNumber }  },
      "Centre X":       'function',
      "Centre Y":       'function',
      "Radius X":       'function',
      "Radius Y":       'function',
      "Starting Angle": { type: 'number', after: $.degToRad },
      "Rotation":       'number',
      "Scale Difference": 'number',
      "Show Actor Sprite": 'bool',
      "Show help window": 'bool',
      "Help Window X": 'function',
      "Help Window Y": 'function',
      "Help Window width": 'function',
      "Help Window height": 'function',
      "Help Window background opacity": 'function'
    }, extraParams || {}));

    return {
      editorParams: editorParams,
      icons:  editorParams.Icons,
      centreX: editorParams["Centre X"],
      centreY: editorParams["Centre Y"],
      radiusX: editorParams["Radius X"],
      radiusY: editorParams["Radius Y"],
      startingAngle: editorParams["Starting Angle"],
      rotation: editorParams["Rotation"],
      scale: editorParams["Scale Difference"],
      showActorSprite: editorParams["Show Actor Sprite"],
      showHelpWindow: editorParams["Show help window"],
      helpWindowOpacity: editorParams["Help Window background opacity"],
      helpWindowRect: function () {
        return new Rectangle(this.editorParams["Help Window X"](),
          this.editorParams["Help Window Y"](),
          this.editorParams["Help Window width"](),
          this.editorParams["Help Window height"]()
        );
      },
      make: function () {
        return {
          icons:  this.icons,
          centre: new Point(this.centreX(), this.centreY()),
          radius: new Point(this.radiusX(), this.radiusY()),
          startingAngle: this.startingAngle,
          rotation: this.rotation,
          scale: this.scale,
          showActorSprite: this.showActorSprite
        };
      }
    };
  }

  // Base window used for skills and items

  $.ui.RingMenu.ItemBase = $.ui.RingMenu.extend();

  $.ui.RingMenu.ItemBase.prototype.initialize = function (parent, params) {
    this.parent = parent;
    $.ui.RingMenu.prototype.initialize.call(this, params);
    this.close(0);
    this._category = 'none';
    this._data = [];
  }

  $.ui.RingMenu.ItemBase.prototype.setCategory = function(category) {
      if (this._category !== category) {
          this._category = category;
          this.refresh();
          this.resetScroll();
      }
  };

  $.ui.RingMenu.ItemBase.prototype.maxItems = function() {
      return this._data ? this._data.length : 1;
  };

  $.ui.RingMenu.ItemBase.prototype.includes = function(item) {
      return false;
  };

  $.ui.RingMenu.ItemBase.prototype.needsNumber = function() {
      return true;
  };

  $.ui.RingMenu.ItemBase.prototype.isEnabled = function(item) {
      return $gameParty.canUse(item);
  };

  $.ui.RingMenu.ItemBase.prototype.makeItemList = function() {
  };

  $.ui.RingMenu.ItemBase.prototype.selectLast = function() {
      var index = this._data.indexOf($gameParty.lastItem());
      this.select(index >= 0 ? index : 0);
  };

  $.ui.RingMenu.ItemBase.prototype.updateHelp = function() {
      this.setHelpWindowItem(this.item());
  };

  $.ui.RingMenu.ItemBase.prototype._refresh = function () {
    this.makeItemList();
    $.ui.RingMenu.prototype._refresh.apply(this, arguments);
  }

  // Item window

  $.ui.RingMenu.Item  = $.ui.RingMenu.ItemBase.extend();

  $.ui.RingMenu.Item.prototype.makeItemList = function() {
      this._data = $gameParty.allItems().filter(function(item) {
          return this.includes(item);
      }, this);
      if (this.includes(null)) {
          this._data.push(null);
      }
  };

  $.ui.RingMenu.Item.prototype.includes = function(item) {
      switch (this._category) {
      case 'item':
          return DataManager.isItem(item) && item.itypeId === 1;
      case 'weapon':
          return DataManager.isWeapon(item);
      case 'armor':
          return DataManager.isArmor(item);
      case 'keyItem':
          return DataManager.isItem(item) && item.itypeId === 2;
      default:
          return false;
      }
  };

  // Skill window

  $.ui.RingMenu.Skill = $.ui.RingMenu.ItemBase.extend();

  $.ui.RingMenu.Skill.prototype.initialize = function () {
    this._actor = null;
    this._stypeId = 0;
    $.ui.RingMenu.ItemBase.prototype.initialize.apply(this, arguments);
  }

  $.ui.RingMenu.Skill.prototype.setActor = function (actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
        this.resetScroll();
    }
  }

  $.ui.RingMenu.Skill.prototype.setStypeId = function(stypeId) {
      if (this._stypeId !== stypeId) {
          this._stypeId = stypeId;
          this.refresh();
          this.resetScroll();
      }
  };

  $.ui.RingMenu.Skill.prototype.makeItemList = function() {
    if (this._actor) {
        this._data = this._actor.skills().filter(function(item) {
            return this.includes(item);
        }, this);
    } else {
        this._data = [];
    }
  };

  $.ui.RingMenu.Skill.prototype.includes = function(item) {
      return item && item.stypeId === this._stypeId;
  };

  $.PARAMETERS['RingMenu'] = params;

})(D$E);
