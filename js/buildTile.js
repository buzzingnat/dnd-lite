
const { requireImage } = require('images');
const { context, WHITE_HEX, GREY900_HEX, RUSTYRED_HEX } = require('gameConstants');
const { state } = require('state');

function buildTile(x, y, width, height, tile) {
  // console.log({tile});
  context.save();
  context.fillStyle = RUSTYRED_HEX;
  if (tile.grandEntrance) context.fillStyle = GREY900_HEX;
  context.strokeStyle = 'blue';
  context.fillRect(x, y, width, height);
  context.fillStyle = WHITE_HEX;
  // shapes are:
  // 2 thru 12 hallways; 102 thru 112 caverns;
  // 202 thru 212 up stairs; 302 thru 312 down stairs;
  // 402 thru 412 both stairs; 504 is the Main Entrance
  let hallway = tile.shape;
  let right = x + width, size = 30, bottom = y + height;
  if (hallway === 'Nesw') {
    context.beginPath();
    context.moveTo(x + size, bottom - size);
    context.lineTo(x + size, y);
    context.lineTo(right - size, y);
    context.lineTo(right - size, bottom - size);
    context.closePath();
    context.fill();
  }
  if (hallway === 'nEsw') {
    context.beginPath();
    context.moveTo(right, y + size);
    context.lineTo(x + size, y + size);
    context.lineTo(x + size, bottom - size);
    context.lineTo(right, bottom - size);
    context.closePath();
    context.fill();
  }
  if (hallway === 'neSw') {
    context.beginPath();
    context.moveTo(x + size, bottom);
    context.lineTo(x + size, y + size);
    context.lineTo(right - size, y + size);
    context.lineTo(right - size, bottom);
    context.closePath();
    context.fill();
  }
  if (hallway === 'nesW') {
    context.beginPath();
    context.moveTo(right - size, y + size);
    context.lineTo(x, y + size);
    context.lineTo(x, bottom - size);
    context.lineTo(right - size, bottom - size);
    context.closePath();
    context.fill();
  }
  if (hallway === 'NeSw') {
    context.beginPath();
    context.moveTo(x + size, bottom);
    context.lineTo(x + size, y);
    context.lineTo(right - size, y);
    context.lineTo(right - size, bottom);
    context.closePath();
    context.fill();
  }
  if (hallway === 'nEsW') {
    context.beginPath();
    context.moveTo(right, y + size);
    context.lineTo(x, y + size);
    context.lineTo(x, bottom - size);
    context.lineTo(right, bottom - size);
    context.closePath();
    context.fill();
  }
  if (hallway === 'NESW') {
    context.beginPath();

    context.moveTo(right - size, y);
    context.lineTo(right - size, y + size);
    context.lineTo(right, y + size);

    context.lineTo(right, bottom - size);
    context.lineTo(right - size, bottom - size);
    context.lineTo(right - size, bottom);

    context.lineTo(x + size, bottom);
    context.lineTo(x + size, bottom - size);
    context.lineTo(x, bottom - size);

    context.lineTo(x, y + size);
    context.lineTo(x + size, y + size);
    context.lineTo(x + size, y);

    context.closePath();
    context.fill();
  }
  if (hallway === 'NesW') {
    context.beginPath();

    context.moveTo(x, bottom - size);
    context.lineTo(right - size, bottom - size);
    context.lineTo(right - size, y);
    context.lineTo(x + size, y);
    context.lineTo(x + size, y + size);
    context.lineTo(x, y + size);

    context.closePath();
    context.fill();
  }
  if (hallway === 'neSW') {
    context.beginPath();

    context.moveTo(x, y + size);
    context.lineTo(right - size, y + size);
    context.lineTo(right - size, bottom);
    context.lineTo(x + size, bottom);
    context.lineTo(x + size, bottom - size);
    context.lineTo(x, bottom - size);

    context.closePath();
    context.fill();
  }
  if (hallway === 'nESw') {
    context.beginPath();

    context.moveTo(right, y + size);
    context.lineTo(x + size, y + size);
    context.lineTo(x + size, bottom);
    context.lineTo(right - size, bottom);
    context.lineTo(right - size, bottom - size);
    context.lineTo(right, bottom - size);

    context.closePath();
    context.fill();
  }
  if (hallway === 'NEsw') {
    context.beginPath();

    context.moveTo(right, bottom - size);
    context.lineTo(x + size, bottom - size);
    context.lineTo(x + size, y);
    context.lineTo(right - size, y);
    context.lineTo(right - size, y + size);
    context.lineTo(right, y + size);

    context.closePath();
    context.fill();
  }
  if (hallway === 'NeSW') {
    context.beginPath();

    context.moveTo(x + size, y);
    context.lineTo(x + size, y + size);
    context.lineTo(x, y + size);
    context.lineTo(x, bottom - size);
    context.lineTo(x + size, bottom - size);
    context.lineTo(x + size, bottom);
    context.lineTo(right - size, bottom);
    context.lineTo(right - size, y);

    context.closePath();
    context.fill();
  }
  if (hallway === 'NEsW') {
    context.beginPath();

    context.moveTo(x + size, y);
    context.lineTo(x + size, y + size);
    context.lineTo(x, y + size);
    context.lineTo(x, bottom - size);
    context.lineTo(right, bottom - size);
    context.lineTo(right, y + size);
    context.lineTo(right - size, y + size);
    context.lineTo(right - size, y);

    context.closePath();
    context.fill();
  }
  if (hallway === 'nESW') {
    context.beginPath();

    context.moveTo(x, y + size);
    context.lineTo(x, bottom - size);
    context.lineTo(x + size, bottom - size);
    context.lineTo(x + size, bottom);
    context.lineTo(right - size, bottom);
    context.lineTo(right - size, bottom - size);
    context.lineTo(right, bottom - size);
    context.lineTo(right, y + size);

    context.closePath();
    context.fill();
  }
  if (hallway === 'NESw') {
    context.beginPath();

    context.moveTo(x + size, y);
    context.lineTo(x + size, bottom);
    context.lineTo(right - size, bottom);
    context.lineTo(right - size, bottom - size);
    context.lineTo(right, bottom - size);
    context.lineTo(right, y + size);
    context.lineTo(right - size, y + size);
    context.lineTo(right - size, y);

    context.closePath();
    context.fill();
  }
  // 102 thru 112 caverns;
  if (tile.cavern) {
    context.beginPath();
    // context.arc(x,y,r,sAngle,eAngle,counterclockwise);
    let r = 40;
    let sAngle = 0, eAngle = 2 * Math.PI;
    context.arc(x + 50,y + 50,r,sAngle,eAngle);
    context.closePath();
    context.fill();
  }
  // 202 thru 212 up stairs;
  if (tile.stairUp) {
    // upstairs icon
    drawIcons(x + state.gridWidth/3 - 5, y - state.gridWidth/4 + 10, 'gfx/dungeon-crawl-stone-soup-edited/prev_level.png');
  }
  // 302 thru 312 down stairs;
  if (tile.stairDown) {
    // downstairs icon
    drawIcons(x - state.gridWidth/3 + 5, y - state.gridWidth/4 + 10, 'gfx/dungeon-crawl-stone-soup-edited/next_level.png');
  }
  context.restore();
}

function drawIcons(x, y, imageSource,
  sourceWidth = 32, sourceHeight = 32,
  sourceOriginX = 0, sourceOriginY = 0, scale = .75) {
  const image = requireImage(imageSource);
  let sx = sourceOriginX, sy = sourceOriginY, sWidth = sourceWidth, sHeight = sourceHeight;
  let dWidth = (state.gridWidth * .5) * scale, dHeight = (dWidth * sHeight / sWidth);
  let dx = x + (state.gridWidth/2 - dWidth / 2), dy = y + (state.gridWidth/2 - dHeight / 2);
  context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

module.exports = {
  buildTile,
};
