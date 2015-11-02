//==============================================================================
// Dragon Engine (D$E) Custom motions
// D$E_CustomMotions.js
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
 * @plugindesc Allows to set up custom motions (poses of sideview characters)
 * for skills or items.
 *
 * @help
 *
 * To change the motion of a skill or item add this tag:
 * <motion: motionName>
 *
 * Where motion name should be any of the following by default:
 *
 *  - walk
 *  - wait
 *  - chant
 *  - guard
 *  - damage
 *  - evade
 *  - thrust
 *  - swing
 *  - missile
 *  - skill
 *  - spell
 *  - item
 *  - escape
 *  - victory
 *  - dying
 *  - abnormal
 *  - sleep
 *  - dead
 *
 */

if (!window.D$E) {
  throw new Error("This plugin requires the 'Dragon Engine (D$E)' to work properly! Ensure your plugin list, or order of plugins.");
}

PluginManager.register("D$E_CustomMotions", "1.0.0", {
	"email": "ramiro.rojo.cretta@gmail.com",
	"website": "http://binarychest.wordpress.com",
	"name": "Ramiro Rojo"
}, "2015-10-26");
