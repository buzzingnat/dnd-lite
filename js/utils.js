
module.exports = {
  createId,
  createRandom,
  doesIntersectCirlce,
  doesIntersectRectangle,
  findCurrentTileItems,
  replaceByIndexInString,
};
const { state } = require('state');

function findCurrentTileItems(x = state.playerLocation[0], y = state.playerLocation[1]) {
  const tile = state.map[y][x];
  const lootIds = tile.lootIds;
  let foundLoot = [];
  if (!tile.lootIds) return false;
  tile.lootIds.forEach(id => {
    let item = state.loot[id];
    foundLoot.push(item);
  });
  return foundLoot;
}

function doesIntersectRectangle(point, rectangle) {
  if (point.x >= rectangle.x &&
    point.x <= rectangle.x + rectangle.width &&
    point.y >= rectangle.y &&
    point.y <= rectangle.y + rectangle.height) {
    return true;
  }
  return false;
}

function doesIntersectCirlce(point, circle) {
  return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.radius;
}

function createRandom(min, max) {
  return Math.floor(Math.random() * (+max - +min)) + +min;
}

function createId() {
  // makes ids that look like: '_6751gf151', '_8372cx335'
  const random1 = Math.floor(Math.random()*1000);
  const random2 = Math.floor(Math.random()*1000);
  const id = '_' + Date.now().toString().substring(9) + random1.toString(36) + random2;
  return id;
}


function replaceByIndexInString(initialString, index, replacement) {
  return initialString.substr(0, index) + replacement + initialString.substr(index + replacement.length);
}
