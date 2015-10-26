//=============================================================================
// Pixel Perfect Colition
// PixelPerfectColition.js
// Version: 1.0.1
//=============================================================================
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
 * @plugindesc Allows to check if two sprites are colliding.
 * This is a tool for scripters.
 *
 * @author Ramiro Rojo
 *
 * @help
 *
 * This plugin doesn't have any parameters.
 *
 * Note: At the current version sprites do take account of anchor,
 * but they don't account rotation or scale into consideration.
 * This will made them quite fast at the cost of not using anything fancy.
 *
 * Ths plugins provides two simple, yet powerful functions:
 *
 * Sprite.prototype.collitionDataWith(rect);
 * - Gives a collition rect between two sprites.
 * - Parameters:
 *   -  sprite: The sprite to check the rect.
 *
 * - Returns: The collition data between both sprites or null if
 *            no collition was made.
 *            The data contains a rect and the initial points of both sprites.
 *
 * Sprite.prototype.collidesWith(sprite[, alpha])
 * - Checks if two sprites are colliding by pixels.
 * - Parameters:
 *   - sprite: The sprite to check collition.
 *   - alpha: The tolerance to check collition, (by default 1)
 *            if you are using alpha blending on your sprites considerer
 *            giving it a larger value.
 *
 * - Returns: true if the sprites are colliding, false otherwise.
 */
//=============================================================================
var Imported = Imported || {};
Imported['PixelPerfectColition'] = '1.0.1';

Sprite.prototype.collitionDataWith = function (sprite) {
  // get the rect of collition
  var w1 = this.scale.x * this.width,
      w2 = sprite.scale.x * sprite.width,
      h1 = this.height,
      h2 = sprite.height,
      x1 = this.x - w1 * this.anchor.x,
      x2 = sprite.x - w2 * sprite.anchor.x,
      y1 = this.y - this.anchor.y * h1,
      y2 = sprite.y - sprite.anchor.y * h2,
      x  = Math.max(x1, x2),
      y  = Math.max(y1, y2),
      n1 = Math.min(x1 + w1, x2 + w2),
      n2 = Math.min(y1 + h1, y2 + h2);
      if (n1 >= x && n2 >= y) {
        return {
          rect: new Rectangle(x, y, n1 - x, n2 - y),
          p1 : new Point(x1, y1),
          p2 : new Point(x2, y2)
        };
      }
      return null;
}

Sprite.prototype.collidesWith = function (sprite /*, alpha  */) {
  var data = this.collitionDataWith(sprite);
  if (!data) {
    return false;
  }
  var rect = data.rect;
  var alpha = arguments.length > 1 ? arguments[1] : 1;
  var p1, p2, a1, b1, a2, b2;
  var ex = rect.width + rect.x;
  var ey = rect.height + rect.y;
  for (var i = rect.x; i < ex; ++i) {
    a1 = i - data.p1.x + this._frame.x;
    a2 = i - data.p2.x + sprite._frame.x;
    for (var j = rect.y; j < ey; ++j) {
      b1 = j - data.p1.y + this._frame.y;
      p1 = this.bitmap.getAlphaPixel(a1, b1);
      b2 = j - data.p2.y + sprite._frame.y;
      p2 = sprite.bitmap.getAlphaPixel(a2, b2);
      if (Number(p1) > 0 && Number(p2) > 0) {
        return true;
      }
    }
  }
  return false;
}

/*

function Scene_PPP() {
  Scene_Base.apply(this, arguments);
}

Scene_PPP.prototype = Object.create(Scene_Base.prototype);
Scene_PPP.prototype.constructor = Scene_PPP;

Scene_PPP.prototype.create = function () {
  this.s1 = new Sprite(ImageManager.loadPicture('s1'));
  this.s2 = new Sprite(ImageManager.loadPicture('s1'));
  this.s2.x = Graphics.width / 2;
  this.s2.y = Graphics.height / 2;
  this.s1.anchor.x = this.s2.anchor.x = 0.5;
  this.s1.anchor.y = this.s2.anchor.y =0.5;
  this.txt = new Sprite(new Bitmap(Graphics.width, 32));
  this.addChild(this.s1);
  this.addChild(this.s2);
  this.addChild(this.txt);
}

Scene_PPP.prototype.update = function () {
  Scene_Base.prototype.update.apply(this, arguments);
  if (TouchInput.isTriggered()) {
    this.s1.x = TouchInput.x;
    this.s1.y = TouchInput.y;
    this.txt.bitmap.clear();
    var t = this.s1.collidesWith(this.s2) ? 'YES!' : 'NO!';
    this.txt.bitmap.drawText('Collide: ' + t, 0, 0, Graphics.width, 32);
  }
}

*/
