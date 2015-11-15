//==============================================================================
// Dragon Engine (D$E) World Map
// D$E_WorldMap.js
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
 * @plugindesc Allows the user to mark maps as "world maps"
 * A world map map has special properties.
 *
 * @param On menu common event id
 * @desc A common event is called when the player presses for the menu.
 * -1 for disables this and allows common functionality. Default: 0
 * @default 0
 *
 * @param On node step common event id
 * @desc A common event is called before the player steps on a node.
 * 0 for disables this. Default: 0
 * @default 0
 *
 * @param On path step common event id
 * @desc A common event to be called when the user travels between two nodes
 * 0 for disables this. Default: 0
 * @default 0
 *
 * @help
 *
 * ============================================================================
 * * Making your map as a World Map
 * ============================================================================
 * Add the tag as <DE_WorldMap> to any of your map you want to become one.
 * The map you select now will behave specially. Your map will be transformed
 * into 'nodes' and 'paths'.
 * A node, represents a place where you can open any kind of choice, being a
 * shop entering a map, or something like that.
 *
 * A path represents a place where the player may go trough, you must connect
 * your nodes trough paths using the region id.
 *
 * The map automatically changes some controls to call a common event when you
 * press the menu button, for example.
 *
 * ============================================================================
 * * Adding paths
 * ============================================================================
 *
 * In order to add a path, you must make a path marked with a region,
 * connecting two nodes.
 *
 * ============================================================================
 * * Adding nodes.
 * ============================================================================
 *
 * A node is just a way to call a fancy event a name.
 * Remember to add as the event's note the value <DE_node>.
 *
 * ============================================================================
 * * Specific common events for specific maps
 * ============================================================================
 * Af you plan on using many world maps and on each you may need a different
 * set of events, you can override the "default behaviour" by adding any of
 * this notetags:
 *
 * Replace id with the id of the common event you want to call.
 *
 * <DE_nodeEventId:id>
 * <DE_pathEventId:id>
 * <DE_menuEventId:id>
 *
 * Each one will take precedence over the global settings, so if you disable it
 * using 0, for example, it will open the normal menu.
 *
 * So a chain of checking works like this:
 * check if the map has custom command, check if global settings are active,
 * default system function (nothing or opening the menu).
 *
 */
if (!window.D$E) {
  throw new Error("The plugin 'D$E_WorldMap' requires the 'Dragon Engine (D$E)' to work properly! Ensure your plugin list, or order of plugins.");
}

D$E.ensureParameters('D$E_WorldMap');

(function ($) {

  var editorParams = $.parametersFromSchema(PluginManager.parameters('D$E_WorldMap'), {
   'On menu common event id': 'number',
   'On node step common event id': 'number',
   'On path step common event id': 'number'
  });

  var params = {
      menuEventId: editorParams['On menu common event id'],
      nodeEventId: editorParams['On node step common event id'],
      pathEventId: editorParams['On path step common event id']
  };

$.WorldMap = {
  _mapData: {}
};

$.WorldMap.isWorldMap = function (mapId) {
  if (!$dataMap) return false;
  return !!MVC.getTag($dataMap.note || '', 'DE_WorldMap');
}

$.WorldMap.data = function () {
  return $gameSystem.d$EWorldMapData();
}

$.WorldMap.mapData = function () {
  if (!$dataMap) return null;
  var id = $gameMap.mapId();
  if (!this._mapData[id]) {
    this._mapData[id] = this._generateData(id);
  }
  return this._mapData[id];
}

$.WorldMap._generateData = function (id) {
  var result = {};
  result.pathEventId   = this._getValue('pathEventId');
  result.nodeEventID   = this._getValue('nodeEventID');
  result.pathEventID   = this._getValue('pathEventID');
  result.nodes         = this._generateNodes(id);
  result.paths         = this._generatePaths(id, result.nodes);
  result.unlockedPaths = this.data().unlockedPaths(id);
  return result;
}

$.WorldMap._getValue = function (name) {
  var value = MVC.getTag($dataMap.note || '', 'DE_' + name);
  if (value === null) {
    return params[name];
  }
  return Number(value.params[0] || '');
}

$.WorldMap._generateNodes = function (id) {
  var result = {};
  return result;
}

$.WorldMap._generatePaths = function (id, nodes) {
  var result = {};
  return result;
}

$.WorldMap.unlock = function (mapId, pathId) {

}

$.WorldMap.lock = function (mapId, pathId) {

}

$.WorldMap.Data = MVC.extend();

$.WorldMap.Data.prototype.initialize = function () {
  this._unlockedPaths = {};
}

$.WorldMap.Data.prototype.unlockedPaths = function (mapId) {
  if (!this._unlockedPaths[mapId]) {
    this._unlockedPaths[mapId] = [];
  };
  return this._unlockedPaths[mapId];
}

Game_System.prototype.d$EWorldMapData = function () {
  if (!this._d$eWorldMapData) {
    this._d$eWorldMapData = $.WorldMap.Data();
  }
  return this._d$eWorldMapData;
}

})(D$E);
