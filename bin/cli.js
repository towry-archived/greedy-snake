#!/usr/bin/env node

var Snake = require('../');

var options = process.argv.slice(2);
var speed = 1000;

if (options.length) {
  speed = +(options[0]);
}
if ((speed + 0) !== speed) {
  help();
}

var snake = new Snake();

setInterval(function () {
  snake.crawl();
}, speed);


function help() {
  console.error("Please give a number.");
  process.exit(1);
}