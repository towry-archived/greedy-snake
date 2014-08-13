var cursor = require('term-cursor');
var Emitter = require('events').EventEmitter;
var util = require('util');

var stdout = process.stdout;
var stdin = process.stdin;
var keypress = require('keypress')(stdin);

// the coords
var coords = {};

/**
 * Expose the Snake object
 */
module.exports = exports = Snake;

/**
 * Each part of the snake should follow the front part's path
 */
function Snake(opts) {
  var opts = opts || {};
  var x, y;

  this.body = [];
  this.len = 1;
  this.dir = 1;
  this.token = '#';
  this.head = null;
  this.food = null;
  this.discard = null;

  x = 0;
  y = 2;

  this.head = new Head(this.dir, {x: x, y: y});
  setCoord(x, y);
  this.body.push(this.head);

  // clear the entire screen
  cursor.reset();

  this.initEvents();
  this.updateScore();
}

/**
 * Inherits
 */
util.inherits(Snake, Emitter);

/**
 * This snake crawl a step one time
 */
Snake.prototype.crawl = function () {
  var len = this.body.length;
  var x, y;

  // create the food
  if (!this.food) {
    this.food = new Head({
      x: getRandomInt(1, stdout.columns - 1),
      y: getRandomInt(2, stdout.rows - 1)
    })
    setCoord(this.food.x, this.food.y);
    cursor.moveTo(this.food.x, this.food.y).write("\x1b[32m"+this.token+"\x1b[0m");
  }

  this.head = new Head(this.dir, this.head);

  x = this.head.x;
  y = this.head.y;

  if (x === this.food.x &&
      y === this.food.y) {
    return this.emit('eat');
  } else if (coords[y] && coords[y][x] === 1) {
    this.over();
  } else {
    setCoord(this.head.x, this.head.y);
  }

  if (len === this.len) {
    this.discard = this.body.pop();
  }

  this.body.unshift(this.head);

  return this.draw();
}

/**
 * Draw the snake
 *
 * @api public
 */
Snake.prototype.draw = function () {
  var x, y;

  // clear the discard part
  if (this.discard !== null) {
    x = this.discard.x;
    y = this.discard.y;
    cursor.moveTo(x, y).write(' ');
    clearCoord(x, y);
  }

  // draw the head
  x = this.head.x;
  y = this.head.y;
  cursor.moveTo(x, y).write(this.token);

  return this;
}

/**
 * Set the dir
 *
 * @api private
 */
Snake.prototype.setDir = function (n) {
  if (Math.abs( (n - this.dir) ) <= 1) {
    return;
  }

  this.dir = n;
}


/**
 * Over and exit process
 *
 * @api public
 */
Snake.prototype.over = function () {
  cursor.reset();
  console.log('Game over');
  console.log('Your score: %d', this.len-1);
  process.exit(0);
}

/**
 * Update the score
 *
 * @api private
 */

Snake.prototype.updateScore = function () {
  var text = util.format("\u001B[40m Score: \u001B[4m%d\u001B[K\u001B[0m\u001B[5m", this.len - 1);

  cursor.moveTo(0,0).write(text);
}


/**
 * Init the events
 *
 * @api private
 */
Snake.prototype.initEvents = function () {
  // make sure this keyword works
  this.onkeypress = this.onkeypress.bind(this);
  stdin.on('keypress', this.onkeypress);
  stdin.setRawMode(true);
  stdin.resume();

  // events
  this.oneat = this.oneat.bind(this);
  this.on('eat', this.oneat);

  this.updateScore = this.updateScore.bind(this);
  this.on('score', this.updateScore);
}

/**
 * Handle eat event
 *
 * @api private
 */
Snake.prototype.oneat = function () {
  var x, y;

  this.head = this.food;
  this.body.unshift(this.head);
  this.len += 1;
  this.emit('score');

  x = this.head.x;
  y = this.head.y;
  this.food = null;
}

/**
 * Handle keypress event
 *
 * @api private
 */
Snake.prototype.onkeypress = function (ch, key) {
  if (!key) return;

  switch (key.name) {
    case 'c':
      if (key.ctrl) {
        this.over();
      }
      break;
    case 'left':
    case 'h':
      this.setDir(0);
      break;
    case 'up':
    case 'k':
      this.setDir(3);
      break;
    case 'right':
    case 'l':
      this.setDir(1);
      break;
    case 'down':
    case 'j':
      this.setDir(4);
      break;
  }
}

/**
 * The snake's head, may become it's body part
 *
 * @param {Number} dir
 * @param {Object} old. The old head, must be a object with two property:x,y
 * @api private
 */
function Head (dir, old) {
  if (!old) {
    old = dir;
    dir = null;
  }

  this.x = old.x;
  this.y = old.y;

  switch (dir) {
    case 0: // left
      this.x -= 1;
      if (this.x < 1) {
        this.x = stdout.columns;
      }
      break;
    case 1: // right
      this.x += 1;
      if (this.x > stdout.columns - 1) {
        this.x = 1;
      }
      break;
    case 3: // top
      this.y -= 1;
      if (this.y < 2) {
        this.y = stdout.rows;
      }
      break;
    case 4: // down
      this.y += 1;
      if (this.y > stdout.rows - 1) {
        this.y = 2;
      }
      break;
  }
}


/**
 * Set coords
 *
 * @api private
 */
function setCoord (x, y) {
  if (! coords[y]) {
    coords[y] = [];
  }
  coords[y][x] = 1;
}

function clearCoord (x, y) {
  if (!coords[y]) return;
  coords[y][x] = void 0;
}

/**
 * Get random
 *
 * @api private
 */
function getRandomInt(min, max) {
  return ~~(Math.random() * (max - min + 1)) + min;
}