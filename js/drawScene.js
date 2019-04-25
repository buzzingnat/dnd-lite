
module.exports = {
  drawScene,
  drawLoot,
  drawPlayer,
};

const { prepareCard, drawRectangleAroundTarget } = require('canvasUtils');
const { findCurrentTileItems } =  require('utils');
const { requireImage } = require('images');

const {
  AMARANTHPINK_HEX,
  BLACK_HEX,
  BOTTOM_MENU_HEIGHT,
  cardBuffer,
  CARD_HEIGHT, CARD_WIDTH,
  canvas, context,
  GRID_WIDTH,
  INDIGO_HEX,
  RUSTYRED_HEX,
  SUNGLOW_HEX,
  WHITE_HEX,
} = require('gameConstants');
const { state, gameColumns, gameRows, } = require('state');

const {
  drawDialogBox,
  drawDialogButton,
  onCavernEnterPopUpDialog,
  onCavernInteractCreaturesPopUpDialog,
  onCavernInteractTreasurePopUpDialog,
} = require('cavern');

const { buildTile } = require('buildTile');

const { onRecieveMove } = require('main');
const { tintImage } =  require('canvasUtils');

function drawScene(playerX, playerY) {
  console.log(`during draw scene, ${state.dialogOpen}`);
  state.clickable = [];
  context.fillStyle = WHITE_HEX;
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < gameRows; row++) {
    for (let col = 0; col < gameColumns; col++) {
      let x = col*GRID_WIDTH, y = row*GRID_WIDTH, width = GRID_WIDTH, height = GRID_WIDTH;
      const tile = state.map[row][col];
      if (!tile) continue;
      // if loot belongs on tile, find it
      let loot = findCurrentTileItems(col, row);
      buildTile(x, y, width, height, tile);
      if (loot) {
        loot.forEach((item, index) => {
          // offset loot slightly based on index
          drawLoot(
            index+1, x, y,
            item.imageSrc, item.widthFrame, item.heightFrame,
            item.stillImage.x, item.stillImage.y, item.scale
          );
        });
      }
    }
  }
  let tile = state.mostRecentTile;
  let tileX = tile.location[0], tileY = tile.location[1];
  if (tile.north) {
    drawTileMoveableHighlight((tileX)*GRID_WIDTH, (tileY-1)*GRID_WIDTH, 0, -1);
  }
  if (tile.east) {
    drawTileMoveableHighlight((tileX+1)*GRID_WIDTH, (tileY)*GRID_WIDTH, 1, 0);
  }
  if (tile.south) {
    drawTileMoveableHighlight((tileX)*GRID_WIDTH, (tileY+1)*GRID_WIDTH, 0, 1);
  }
  if (tile.west) {
    drawTileMoveableHighlight((tileX-1)*GRID_WIDTH, (tileY)*GRID_WIDTH, -1, 0);
  }
  drawPlayer(playerX, playerY);
  if (state.dialogOpen === 'onPartyView') {
    onPartyViewPopUpDialog();
  }
  if (tile.cavern && !tile.grandEntrance) {
    if (!tile.loot
      || tile.loot.length <= 0
    ) state.dialogOpen = false;
    if (state.dialogOpen === 'onCavernEnter' && tile.loot) {
      onCavernEnterPopUpDialog(tile.loot);
    }
    if (state.dialogOpen === 'onCavernInteractCreatures' && tile.loot) {
      onCavernInteractCreaturesPopUpDialog(tile.loot);
    }
    if (state.dialogOpen === 'onCavernInteractTreasure' && tile.loot) {
      onCavernInteractTreasurePopUpDialog(tile.loot);
    }
  }
  drawMenuBackground();
  drawGameMenuButton();
  drawPartyMenuButton();
  drawSoundMenuButton();
}

function drawPlayer(
    x = (state.playerLocation[0]*GRID_WIDTH) + GRID_WIDTH/2,
    y = (state.playerLocation[1]*GRID_WIDTH) + GRID_WIDTH/2
  ) {
  let sx = 0, sy = 576, sWidth = 64, sHeight = 64;
  let dWidth = (GRID_WIDTH/2), dHeight = (dWidth * sHeight / sWidth);
  let dx = x - dWidth/2, dy = y - dHeight/2;
  const playerImage = requireImage(`gfx/creatures/heroine.png`);
  context.drawImage(playerImage, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  // drawRectangleAroundTarget(dx, dy, dWidth, dHeight);
  state.playerX = x;
  state.playerY = y;
  state.playerWidth = dWidth;
  state.playerHeight = dHeight;
}

function drawLoot(offset, x, y, imageSource, sourceWidth, sourceHeight, sourceOriginX, sourceOriginY, scale = 1) {
  const image = requireImage(imageSource);
  let sx = sourceOriginX, sy = sourceOriginY, sWidth = sourceWidth, sHeight = sourceHeight;
  let dWidth = (GRID_WIDTH/2) * scale, dHeight = (dWidth * sHeight / sWidth);
  let right = x + GRID_WIDTH*3/4 - dWidth/2;
  let left = x + GRID_WIDTH/4 - dWidth/2;
  let bottom = y + GRID_WIDTH - 5 - dHeight;
  let top = y + (GRID_WIDTH*5/8) - dHeight;
  let dx = x + GRID_WIDTH/2, dy = y + GRID_WIDTH/2;
  if (offset === 1) {
    dx = left + 10, dy = top;
  }
  if (offset === 2) {
    dx = right - 10, dy = top;
  }
  if (offset === 3) {
    dx = right, dy = bottom;
  }
  if (offset === 4) {
    dx = left, dy = bottom;
  }
  context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  // drawRectangleAroundTarget(dx, dy, dWidth, dHeight);
}

function drawTileMoveableHighlight(x, y, dx, dy) {
  let padding = Math.floor(GRID_WIDTH/18);
  let width = GRID_WIDTH - padding*2, height = GRID_WIDTH - padding*2;
  x = Math.floor(x + padding), y = Math.floor(y + padding);
  let effect = () => {
    onClickTileMoveableHighlight(dx, dy);
  };
  // rectangle
  context.save();
  context.beginPath();
  context.lineWidth = '2';
  context.strokeStyle = SUNGLOW_HEX;
  context.rect(x, y, width, height);
  context.stroke();
  context.closePath();
  state.clickable.push({id: `tileHighlight-${x}-${y}`, x, y, width, height, effect});
}

function onClickTileMoveableHighlight(dx, dy) {
  if (state.animationId) clearInterval(state.animationId);
  let goal = [...state.playerLocation];
  goal[0] += dx;
  goal[1] += dy;
  onRecieveMove(goal, dx, dy);
}

function drawMenuBackground() {
  let top = canvas.height - GRID_WIDTH/1.5;
  let left = 0, width = canvas.width;
  let height = BOTTOM_MENU_HEIGHT;
  context.save();
  context.fillStyle = RUSTYRED_HEX;
  context.fillRect(left, top, width, height);
  context.fillStyle = AMARANTHPINK_HEX;
  top = top - 2, height = 2;
  context.fillRect(left, top, width, height);
  context.closePath();
  context.restore();
}

function drawGameMenuButton() {
  let dWidth = Math.floor(GRID_WIDTH/1.5), dHeight = Math.floor(GRID_WIDTH/1.5);
  let dx = Math.floor(canvas.width - canvas.width/6), dy = canvas.height - dHeight;
  let effect = () => {
    console.log(`You clicked on the menu button`);
  };
  // icon
  const image = requireImage(`gfx/menu-icons.png`);
  tintImage(image, 100, 0, 100, 100, dx, dy, dWidth, dHeight, WHITE_HEX);
  state.clickable.push({
    id: 'game-menu-main',
    x:dx, y:dy,
    width:dWidth, height:dHeight,
    effect
  });
}

function drawPartyMenuButton() {
  let dWidth = Math.floor(GRID_WIDTH/1.5);
  let dHeight = Math.floor(GRID_WIDTH/1.5);
  let dx = Math.floor(canvas.width - (canvas.width/6)*3);
  let dy = canvas.height - dHeight;
  let effect = () => {
    console.log(`You clicked on the party button`);
    onClickPartyMenuButton();
  };
  // icon
  const image = requireImage(`gfx/menu-icons.png`);
  tintImage(image, 0, 0, 100, 100, dx, dy, dWidth, dHeight, WHITE_HEX);
  state.clickable.push({
    id: 'game-menu-party',
    x: dx, y: dy,
    width: dWidth, height: dHeight,
    effect
  });
}

function onClickPartyMenuButton() {
  console.log(`before draw scene`);
  state.dialogOpen = `onPartyView`;
  drawScene();
  console.log(`after draw scene`);
}

function onPartyViewPopUpDialog() {
  state.clickable = [];
  console.log({playerParty: state.playerParty});
  const playerPartyList = [...Object.values(state.playerParty)];
  let {
    dialogX, dialogY,
    dialogHeight, dialogWidth,
    dialogCenter
  } = drawDialogBox();
  // draw text
  context.save();
  context.textAlign = 'center';
  context.fillStyle = BLACK_HEX;
  context.font = '20px Times New Roman';
  context.fillText(
    'Your party is currently...',
    canvas.width / 2, dialogY + 20
  );
  function onPartyCardClick(id) {
    for (let key in state.playerParty) {
      state.playerParty[key].selectedCard = false;
    }
    state.playerParty[id].selectedCard = true;
    console.log({dialog: state.dialogOpen});
    drawScene();
  }
  // find width and height of box all cards fit into
  let cardMargin = 5;
  let allCardsWidth = Math.floor(( (playerPartyList.length-1)*CARD_WIDTH/2 ) + CARD_WIDTH + (cardMargin*(playerPartyList.length-1)) );
  let allCardsHeight = Math.floor(CARD_HEIGHT);
  // center card box in dialog
  let allCardsX = (dialogX + dialogWidth/2 - allCardsWidth/2);
  let allCardsY = Math.floor(dialogY + dialogHeight/2 - allCardsHeight/2);
  // draw rectangle displaying where box is located
  // drawRectangleAroundTarget(allCardsX, allCardsY, allCardsWidth, allCardsHeight);
  let selectedCard;
  for (let i = 0; i < playerPartyList.length; i++) {
    let item = playerPartyList[i];
    if (item.selectedCard) {
      selectedCard = item;
      break;
    }
  }
  if (!selectedCard) {
    selectedCard = playerPartyList[0];
    playerPartyList[0].selectedCard = true;
    state.playerParty[playerPartyList[0].id].selectedCard = true;
  }
  // starting x value, add as cards are created
  let cardX = allCardsX;
  playerPartyList.forEach((item, index) => {
    // draw cards from left to right
    prepareCard(item);
    let cardY = allCardsY;
    if (item.selectedCard) {
      console.log({selectedItem: item});
      context.drawImage(cardBuffer, cardX, cardY, CARD_WIDTH, CARD_HEIGHT);
      state.clickable.push({
        id: `party-card-selected-${item.id}`,
        x: cardX, y: cardY,
        width: CARD_WIDTH, height: CARD_HEIGHT,
        effect: () => onPartyCardClick(item.id)
      });
      cardX += CARD_WIDTH + cardMargin;
    } else {
      context.drawImage(
        cardBuffer, cardX, cardY+CARD_HEIGHT/4,
        CARD_WIDTH/2, CARD_HEIGHT/2
      );
      state.clickable.push({
        id: `party-card-${item.id}`,
        x: cardX, y: cardY,
        width: CARD_WIDTH, height: CARD_HEIGHT,
        effect: () => onPartyCardClick(item.id)
      });
      cardX += (CARD_WIDTH/2) + cardMargin;
    }
  });
  context.restore();
  // buttons and button actions
  const buttonHeight = 40, buttonWidth = 100;
  const buttonBottomMargin = dialogHeight + dialogY - (buttonHeight + 20);
  function closeDialog() {
    state.dialogOpen = false;
    drawScene();
  }
  drawDialogButton('Close', closeDialog,
    dialogCenter + ((dialogWidth / 4) - 100/2), buttonBottomMargin,
    buttonWidth, buttonHeight,
    INDIGO_HEX, tinycolor(INDIGO_HEX).lighten(20).toString(), WHITE_HEX);
}

function drawSoundMenuButton() {
  let dWidth = Math.floor(GRID_WIDTH/1.5), dHeight = Math.floor(GRID_WIDTH/1.5);
  let dx = Math.floor(canvas.width - (canvas.width/6)*5), dy = canvas.height - dHeight;
  let effect = () => {
    state.soundOn = !state.soundOn;
    drawScene();
    console.log(`You clicked on the sound button`);
  };
  // icon
  const image = requireImage(`gfx/menu-icons.png`);
  let frame = state.soundOn ? 300 : 200;
  tintImage(image, frame, 0, 100, 100, dx, dy, dWidth, dHeight, WHITE_HEX);
  state.clickable.push({
    id: 'game-menu-sound',
    x:dx, y:dy,
    width:dWidth, height:dHeight,
    effect
  });
}
