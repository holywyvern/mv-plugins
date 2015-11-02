//==============================================================================
// Dragon Engine (D$E) BattleRotationPerspective
// D$E_BattleRotationPerspective.js
// Version 0.1.0
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
 *@plugindesc Allows the user to manipulate angle and inclination in battlers,
 *to imitate the animations used in golden sun.
 *
 * @param Starting actor angle
 * @desc The starting angle for actors, in degrees (0-360).
 * Default: 275
 * @default 275
 *
 * @param Ending actor angle
 * @desc At how many degrees actors should stop (0-360).
 * Default: 350
 * @default 350
 *
 * @param Starting enemy angle
 * @desc The starting angle for enemies, in degrees (0-360).
 * Default: 90
 * @default 90
 *
 * @param Ending enemy angle
 * @desc How many degrees an enemy adds with it's index (0-360)
 * Default: 10
 * @default 10
 *
 * @param Horizontal centre
 * @desc The centre of the middle point of the circular position.
 * Default: Graphics.boxWidth / 2
 * @default Graphics.boxWidth / 2
 *
 * @param Vertical centre
 * @desc The vertical centre used by the circular position.
 * Default: Graphics.boxHeight / 2 - Graphics.boxHeight / 8
 * @default Graphics.boxHeight / 2 - Graphics.boxHeight / 8
 *
 * @param Vertical radius
 * @desc The vertical radius used by the circular position.
 * Default: Graphics.boxHeight / 8
 * @default Graphics.boxHeight / 8
 *
 * @param Horizontal radius
 * @desc The horizontal radius used by the circular position.
 * Default: Graphics.boxWidth * 3 / 2
 * @default Graphics.boxWidth * 3 / 2
 *
 * @param Allow Plugin command
 * @desc Allow Plugin commands calls from this plugin.
 * Default: yes
 * Default: yes
 * @default yes
 *
 * @param Plugin command name
 * @desc the Plugin Parameter name you want to use for this plugin.
 * Default: BRP
 * @default BRP
 *
 *@help
 *
 * Add this plugin named as 'BattleRotationPerspective' in your plugins folder.
 *
 * Remember to activate sideview battles in your system!
 *
 * Also, D$E_BattleRotationPerspective must be the name of this plugin!
 *
 */
var Imported = Imported || {};

if (!window.D$E) {
  throw new Error("The plugin 'D$E_BattleRotationPerspective' requires the 'Dragon Engine (D$E)' to work properly! Ensure your plugin list, or order of plugins.");
}

if (PluginManager.register) {
  PluginManager.register("D$E_BattleRotationPerspective", "1.0.0", {
	"email": "ramiro.rojo.cretta@gmail.com",
	"website": "http://binarychest.wordpress.com",
	"name": "Ramiro Rojo"
  }, "2015-10-26");
} else {
  Imported["D$E_BattleRotationPerspective"] = "1.0.0";
}

D$E.ensureParameters('D$E_BattleRotationPerspective');

(function ($) {
  "use strict";
  var editorParams = $.parametersFromSchema(PluginManager.parameters("D$E_BattleRotationPerspective"), {
    "Starting actor angle": { type:'number', after: $.degToRad },
    "Ending actor angle"  : { type:'number', after: $.degToRad },
    "Starting enemy angle": { type:'number', after: $.degToRad },
    "Ending enemy angle"  : { type:'number', after: $.degToRad },
    "Horizontal centre"   : 'function',
    "Vertical centre"     : 'function',
    "Horizontal radius"   : 'function',
    "Vertical radius"     : 'function',
    "Allow Plugin command": { type: 'bool' },
    "Plugin command name" : 'string'
  });

  var params = {
    // angles are converted to radians for quicker process.
    startingActorAngle: editorParams["Starting actor angle"],
    endingActorAngle: editorParams["Ending actor angle"],
    startingEnemyAngle: editorParams["Starting enemy angle"],
    endingEnemyAngle: editorParams["Ending enemy angle"],
    // centre and starting radius are stored as points.
    centre: new Point(
      /* x: */ editorParams["Horizontal centre"],
      /* y: */ editorParams["Vertical centre"]
    ),
    startingRadius: new Point(
      /* x: */ editorParams["Horizontal radius"],
      /* y: */ editorParams["Vertical radius"]
    ),
    allowPluginCommand: editorParams["Allow Plugin command"],
    pluginCommand: editorParams["Plugin command name"],
  };

  function _handleCommand(/* ... */) {

  }

  $.BattleRotationPerspective = {};
  $.BattleRotationPerspective._handleCommand = _handleCommand;

  $.PARAMETERS['BattleRotationPerspective'] = params;

  if (params.allowPluginCommand) {
    $.addCommandHandle(params.pluginCommand, $.BattleRotationPerspective);
  }

})(D$E);
