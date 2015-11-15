//==============================================================================
// Dragon Engine (D$E) Ring Scene Item
// D$E_RingMenuItem.js
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
  * @plugindesc Implements a generic item interface for selecting items as a
  * ring menu.
  *
  */
  if (!window.D$E) {
    throw new Error("This plugin requires the 'Dragon Engine (D$E)' to work properly! Ensure your plugin list, or order of plugins.");
  }

  D$E.ensureParameters('D$E_RingMenuItem');


  (function ($) {
    "use strict";
    if (!$.ui || !$.ui.RingMenu) {
      throw "The Scene Menu with a ring menu requires the Ring menu (D$E_RingMenuItem) to work!";
    }
    var params = RingMenu.readParams('D$E_RingMenuItem');





  })(D$E);
