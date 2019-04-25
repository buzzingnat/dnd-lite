
module.exports = {
  animatePlayerWalk,
  onRecieveMove,
}

const { requireImage } = require('images');

const {
  makeNewCavern,
} = require('cavern');

const { lootData } = require('lootData');
const { drawScene } = require('drawScene');
const {
  createId,
  createRandom,
  doesIntersectRectangle,
  findCurrentTileItems,
  replaceByIndexInString,
} =  require('utils');

const {
  canvas, context,
  compositeCanvas, compositeContext,
  GRID_WIDTH,
} = require('gameConstants');

const {
  state, gameRows,
} = require('state');

function buildMap() {
  // start game with empty map except initial tile
  for (let i = 0; i < gameRows; i++) {
    state.map[i] = [];
  }
  state.map[state.playerLocation[1]][state.playerLocation[0]] = Object.assign({}, state.mostRecentTile);
}

function animatePlayerWalk(startX, startY, endX, endY, frames = 10, speed = 30) {
  const horizontalTick = Math.floor((endX - startX)/frames);
  const verticalTick = Math.floor((endY - startY)/frames);
  // move player
  if (state.animationId) clearInterval(state.animationId);
  state.animationId = setInterval(animate, speed);
  let tick = 0;
  function animate() {
    if (tick >= frames) {
      clearInterval(state.animationId);
      state.animationId = 0;
      console.log(`animatePlayer, finish moving now...`);
      drawScene();
    } else {
      drawScene(state.playerX + horizontalTick, state.playerY + verticalTick);
      tick++;
    }
  }
}
//state.lastPlayerX, state.playerX, state.animationFramesLeft = 10;
//const p = 1 - state.animationFramesLeft / 10; // p goes from 0 to 1, as animationFramesLeft goes from 10 to 0
//const currentPlayerX = state.playerX * (1 - p) + p * state.lastPlayerX;
// If you want to get from A to B as p goes from 0 to 1, p*A + (1 - p)*B = p * (A - B) + B

function onRecieveMove(goal, dx, dy) {
  state.retreatedOnce = false;
  const x = state.playerX, y = state.playerY;
  let hitWall = false, newTile, nextTile;
  const currentTile = state.map[state.playerLocation[1]][state.playerLocation[0]];

  if (!state.map[goal[1]][goal[0]]) {
    newTile = true;
    let north = createRandom(0, 6) > 1 ? 'N' : 'n';
    let east = createRandom(0, 6) > 1 ? 'E' : 'e';
    let south = createRandom(0, 6) > 1 ? 'S' : 's';
    let west = createRandom(0, 6) > 1 ? 'W' : 'w';
    let directionArray = ['N', 'E', 'S', 'W'];
    let s = north + east + south + west;
    if (s === 'nesw' || s === 'Nesw' || s === 'nEsw' || s === 'neSw' || s === 'nesW') {
      let direction = createRandom(0,3);
      let direction2 = createRandom(0, 3);
      if (direction === direction2) (direction2+1)%4;
      s = replaceByIndexInString(s, direction, directionArray[direction]);
      s = replaceByIndexInString(s, direction2, directionArray[direction2]);
    }
    nextTile = {
      cavern: createRandom(0, 10) < 2,
      location: [...goal],
      shape: s,
      north: north === 'N',
      east: east === 'E',
      south: south === 'S',
      west: west === 'W',
      stairUp: createRandom(0, 10) < 2,
      stairDown: createRandom(0, 10) < 2,
    };
  } else {
    nextTile = state.map[goal[1]][goal[0]];
  }
  if (dy === -1) {
    hitWall = (!currentTile.north || !nextTile.south);
    if (hitWall) currentTile.north = false;
  }
  if (dx === 1) {
    hitWall = (!currentTile.east || !nextTile.west);
    if (hitWall) currentTile.east = false;
  }
  if (dy === 1) {
    hitWall = (!currentTile.south || !nextTile.north);
    if (hitWall) currentTile.south = false;
  }
  if (dx === -1) {
    hitWall = (!currentTile.west || !nextTile.east);
    if (hitWall) currentTile.west = false;
  }
  if (hitWall) {
    // reset current tile to show deadend
    currentTile.shape =
      (currentTile.north?'N':'n')
      + (currentTile.east?'E':'e')
      + (currentTile.south?'S':'s')
      + (currentTile.west?'W':'w');
    drawScene();
    // clear goal tile, don't display it
    nextTile = false;
    return;
  }
  state.map[goal[1]][goal[0]] = nextTile;
  if (newTile) newTile = nextTile;
  drawScene();

  state.mostRecentTile = nextTile;
  // check if new tile found is a cavern
  if (newTile && newTile.cavern) {
    makeNewCavern(goal[0], goal[1]);
  } else if (nextTile.cavern) {
    // lootIds are stored ON THE TILES now, so use lootIds to collect all loot items
    let loot = findCurrentTileItems(goal[0], goal[1]);
    if (!state.dialogOpen || state.dialogOpen === 'onCavernEnter') state.dialogOpen = 'onCavernEnter';
    state.mostRecentTile.loot = [...loot];
  } else {
    state.dialogOpen = false;
  }
  state.playerPreviousLocation = state.playerLocation;
  state.playerLocation = goal;
  console.log({tile: state.mostRecentTile});
  animatePlayerWalk(x, y, x + dx * GRID_WIDTH, y + dy * GRID_WIDTH);
}

function onKeyUp(event) {
  // c (for colorblind testing) is keyCode 67
  if ((event.keyCode >= 36 && event.keyCode <= 40) || event.keyCode === 67) {
    event.preventDefault();
  } else {
    return;
  }
  if (state.animationId) clearInterval(state.animationId);
  if (event.keyCode === 67) {
    // display current canvas as grayscale when "c" is pressed
    compositeContext.save();
    compositeContext.clearRect(0, 0, canvas.width, canvas.height);
    // give canvas a white background
    compositeContext.fillStyle = '#ffffff'; // true white for color conversion to work
    compositeContext.fillRect(0, 0, canvas.width, canvas.height);
    // set global composite operation to luminosity
    compositeContext.globalCompositeOperation = 'luminosity';
    // draw previous canvas image on top of white background
    compositeContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    compositeContext.restore();
    context.drawImage(compositeCanvas, 0, 0, canvas.width, canvas.height);
    return;
  }
  // state.retreatedOnce = false;
  // const x = state.playerX, y = state.playerY, gridWidth = state.gridWidth;
  let goal = [...state.playerLocation];
  // let hitWall = false, newTile, nextTile;
  // const currentTile = state.map[state.playerLocation[1]][state.playerLocation[0]];
  let dx = 0, dy = 0;
  if (event.keyCode === 40) dy = 1;
  else if (event.keyCode === 39) dx = 1;
  else if (event.keyCode === 38) dy = -1;
  else if (event.keyCode === 37) dx = -1;

  goal[0] += dx;
  goal[1] += dy;
  onRecieveMove(goal, dx, dy);
}

document.onkeyup = onKeyUp;

canvas.addEventListener('click', (e) => {
  const mousePoint = {
    x: e.clientX,
    y: e.clientY
  };
  state.clickable.forEach(shape => {
    if (doesIntersectRectangle(mousePoint, shape)) {
      shape.effect();
    }
  });
});

// set default initial party
let playerPartyOptions = [lootData.heroine, lootData.man, lootData.priest, lootData.wizard];
let defaultPlayerParty = {};
for (let i = 0; i < 3; i++) {
  let item = {...playerPartyOptions[createRandom(0,playerPartyOptions.length)]};
  const id = createId();
  item.id = id;
  defaultPlayerParty[id] = item;
}
if (Object.keys(state.playerParty).length === 0 && state.playerParty.constructor === Object) {
  state.playerParty = defaultPlayerParty;
}
buildMap();
// preload all images for game
function preloadAndDisplayImages() {
  Object.values(lootData).forEach(item => requireImage(item.imageSrc));
  const playerImage = requireImage(`gfx/creatures/heroine.png`);
  playerImage.onload = () => drawScene();
  // arrow function to remove default from .onload()
  // playerImage.onload = () => drawPlayer();
  const menuIcons = requireImage(`gfx/menu-icons.png`);
  menuIcons.onload = () => drawScene();
  const cardImage = requireImage(`gfx/decorative-border.png`);
  cardImage.onload = () => drawScene();
}
preloadAndDisplayImages();
drawScene();
