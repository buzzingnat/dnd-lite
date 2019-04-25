
const { canvas } = require('gameConstants');

const gameColumns = canvas.width/100;
const gameRows = canvas.height/100;

let state = {
  clickable: [],
  currentDepth: 2,
  dialogOpen: false,
  gridWidth: 100,
  loot: {},
  map: [],
  nextTile: {shape: 0, loot: [], location: [0, 0]},
  playerHeight: 64,
  playerLocation: [Math.floor(gameColumns/2), Math.floor(gameRows/2)],
  playerParty: {},
  playerPreviousLocation: [],
  playerWidth: 64,
  playerX: 0,
  playerY: 0,
  retreatedOnce: false,
  soundOn: true,
  animationId: 0,
};
window.state = state;
state.mostRecentTile = {
  shape: 'NESW',
  stairUp: true,
  cavern: true,
  grandEntrance: true,
  loot: false,
  location: state.playerLocation,
  north: true, east: true, south: true, west: true,
};

module.exports = {
  state,
  gameColumns,
  gameRows,
};
