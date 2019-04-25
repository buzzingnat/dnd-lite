
module.exports = {
  drawDialogBox,
  drawDialogButton,
  makeNewCavern,
  onCavernEnterPopUpDialog,
  onCavernInteractCreaturesPopUpDialog,
  onCavernInteractTreasurePopUpDialog,
};

const {
  createId,
  createRandom,
  findCurrentTileItems,
} =  require('utils');
const { requireImage } = require('images');
const { tintImage, prepareCard } = require('canvasUtils');
const { lootDeck } = require('lootData');
const {
  BOTTOM_MENU_HEIGHT,
  canvas,
  cardBuffer,
  CARD_HEIGHT,
  CARD_WIDTH,
  context,
  INDIGO_HEX,
  SUNGLOW_HEX,
  RUSTYRED_HEX,
  LIGHTCRIMSON_HEX,
  WHITE_HEX,
  GREY200_HEX,
  GREY500_HEX,
  GREY700_HEX,
  // GREY900_HEX,
  BLACK_HEX,
  LEADERSHIP_ORDER,
} = require('gameConstants');
const { state } = require('state');
const { drawScene } = require('drawScene');
const { animatePlayerWalk } = require('main');

function makeNewCavern(x, y) {
  state.dialogOpen = 'onCavernEnter';
  let createLootList = function() {
    let lootAmount = state.currentDepth;
    let lootList = [];
    for (let i = 0; i < lootAmount; i++) {
      let item = {...lootDeck[createRandom(0,lootDeck.length)]};
      const id = createId();
      if (state.map[y][x].lootIds) {
        state.map[y][x].lootIds.push(id);
      } else {
        state.map[y][x].lootIds = [id];
      }
      item.id = id;
      state.loot[id] = item;
      lootList.push(item);
    }
    return lootList;
  }
  state.mostRecentTile.loot = createLootList();
  state.mostRecentTile.lootIds = [...state.map[y][x].lootIds];
  drawScene();
}

function drawDialogBox(lineWidth) {
  if (!lineWidth) lineWidth = 3;
  const dialogHeight = Math.floor(
    Math.max(Math.floor(canvas.height/1.25), 300) - BOTTOM_MENU_HEIGHT
  );
  const dialogWidth = Math.max(Math.floor(canvas.width/1.25), 250);
  const dialogX = Math.floor(dialogWidth/8);
  const dialogY = Math.floor(dialogHeight/8);
  const dialogCenter = Math.floor(canvas.width / 2);
  context.save();
  // Draw grey bordered white rectangle
  context.globalAlpha = 0.7; // transparency on for dialog box
  context.beginPath();
  context.lineWidth = lineWidth;
  context.strokeStyle = GREY700_HEX;
  context.rect(dialogX, dialogY, dialogWidth, dialogHeight);
  context.stroke();
  context.lineWidth = '0';
  context.fillStyle = WHITE_HEX; // white
  context.fillRect(
    dialogX + lineWidth/2, dialogY + lineWidth/2,
    dialogWidth - lineWidth, dialogHeight - lineWidth
  );
  context.closePath();
  context.globalAlpha = 1; // transparency off for future drawing
  context.restore();
  return {dialogX, dialogY, dialogHeight, dialogWidth, dialogCenter};
}

function onCavernEnterPopUpDialog(loot) {
  let {dialogX, dialogY, dialogHeight, dialogWidth, dialogCenter} = drawDialogBox();
  // draw text
  context.save();
  context.textAlign = 'center';
  context.fillStyle = BLACK_HEX;
  context.font = '20px Times New Roman';
  context.fillText(
    'You have discovered a cavern. It contains:',
    canvas.width / 2, dialogY + 30
  );
  const partyLeader = determinePartyLeader(loot);
  loot.forEach((item, index) => {
    // drawCard
    prepareCard(item);
    context.drawImage(cardBuffer, (canvas.width / 2) - (CARD_WIDTH+10)*index, dialogY + 45, CARD_WIDTH, CARD_HEIGHT);
  });
  context.restore();
  // buttons and button actions
  function retreat() {
    state.dialogOpen = false;
    let gridWidth = state.gridWidth;
    let x = state.playerLocation[0], y = state.playerLocation[1];
    let dx = state.playerPreviousLocation[0], dy = state.playerPreviousLocation[1];
    animatePlayerWalk(x * gridWidth, y * gridWidth, dx * gridWidth, dy * gridWidth);
    state.playerLocation = state.playerPreviousLocation;
    state.mostRecentTile.location = state.playerPreviousLocation;
    state.mostRecentTile.shape = state.map[dy][dx];
    // if loot belongs on tile, find it
    let previousLoot = findCurrentTileItems(dx, dy);
    if (previousLoot) {
      state.mostRecentTile.loot = [...previousLoot];
    } else {
      state.mostRecentTile.loot = [];
    }
    if (state.mostRecentTile.loot.length > 0) state.dialogOpen = 'onCavernEnter';
    state.retreatedOnce = true;
  }
  const buttonHeight = 40, buttonWidth = 100;
  const buttonBottomMargin = dialogHeight + dialogY - (buttonHeight + 20);
  if (state.retreatedOnce) {
    drawDialogButton(
      'Retreat', () => console.log(`disabled`),
      dialogCenter - ((dialogWidth / 4) + 100/2), buttonBottomMargin,
      buttonWidth, buttonHeight, GREY200_HEX, GREY500_HEX, GREY700_HEX
    );
  } else {
    drawDialogButton(
      'Retreat', retreat,
      dialogCenter - ((dialogWidth / 4) + 100/2), buttonBottomMargin,
      buttonWidth, buttonHeight
    );
  }
  function enter() {
    if (loot.find(item => {
      if (item.creature) return true;
      return false;
    })) {
      state.dialogOpen = 'onCavernInteractCreatures';
    } else {
      state.dialogOpen = 'onCavernInteractTreasure';
    }
    state.retreatedOnce = false;
    drawScene();
  }
  drawDialogButton('Enter', enter,
    dialogCenter + ((dialogWidth / 4) - 100/2), buttonBottomMargin,
    buttonWidth, buttonHeight,
    INDIGO_HEX, tinycolor(INDIGO_HEX).lighten(20).toString(), WHITE_HEX);
}

function determinePartyLeader(loot) {
  let leaderFound, leaderMade, highestPosition = 0;
  // first check if there is currently a leader marked
  loot.forEach((item) => {
    if (!item.creature) return;
    if (item.partyLeader) {
      console.log(`a leader exists`);
      leaderFound = item;
      return item;
    }
  });
  if (leaderFound) {
    return leaderFound;
  }
  // if no leader found, then loop again to set the leader
  loot.forEach((item) => {
    if (!item.creature) return;
    let positionInList = LEADERSHIP_ORDER.indexOf(item.contents);
    if (positionInList >= highestPosition) {
      highestPosition = positionInList;
      leaderMade = item;
    }
  });
  if (leaderMade) {
    leaderMade.partyLeader = true;
    return leaderMade;
  }
  return false;
}

function onCavernInteractCreaturesPopUpDialog(loot) {
  let {dialogX, dialogY, dialogHeight, dialogWidth, dialogCenter} = drawDialogBox();
  // draw text
  context.save();
  context.textAlign = 'center';
  context.fillStyle = BLACK_HEX;
  context.font = '20px Times New Roman';
  context.fillText(
    'In this cavern there are:',
    canvas.width / 2, dialogY + 30
  );
  loot.forEach((item, index) => {
    // drawCard
    prepareCard(item);
    context.drawImage(cardBuffer, (canvas.width / 2) - (CARD_WIDTH+10)*index, dialogY + 45, CARD_WIDTH, CARD_HEIGHT);
  });
  context.fillText(
    'What do you do?',
    dialogCenter, dialogY + dialogHeight - 80
  );
  context.restore();
  // buttons and button actions
  const buttonHeight = 40, buttonWidth = 100;
  const buttonBottomMargin = dialogHeight + dialogY - (buttonHeight + 20);
  const partyLeader = determinePartyLeader(loot);
  function befriend() {
    let partyAsString = '';
    Object.entries(state.playerParty).forEach(item=>partyAsString+= item[1].contents + ', ');
    console.log(`You, a party of ${partyAsString.trim()} try to befriend the party led by ${partyLeader.contents}`);
    console.log(`Friendly: ${partyLeader.friendRoll.max} - ${partyLeader.friendRoll.min}`);
    let yourRoll = createRandom(1, 6);
    console.log({yourRoll})
    if (yourRoll >= partyLeader.friendRoll.min && partyLeader.friendRoll.min > 0) {
      console.log(`Success! You befriend the party.`);
    } else if (yourRoll >= partyLeader.neutralRoll.min && partyLeader.neutralRoll.min > 0) {
      console.log(`Failure. The strangers are unimpressed with your conversational skills. You may try again or move through the cave.`);
    } else {
      console.log(`Epic failure! The strangers are very offended and immediately attack you!`);
    }
    state.dialogOpen = false;
    drawScene();
  }
  drawDialogButton(
    'Befriend', befriend,
    dialogX + 20, buttonBottomMargin,
    buttonWidth, buttonHeight,
    INDIGO_HEX, tinycolor(INDIGO_HEX).lighten(20).toString(), WHITE_HEX
  );
  function attack() {
    console.log(`Attack the party led by ${partyLeader.contents}`);
    state.dialogOpen = false;
    drawScene();
  }
  drawDialogButton('Attack', attack,
    dialogX + dialogWidth/2 - buttonWidth/2, buttonBottomMargin,
    buttonWidth, buttonHeight
  );
  function sneak() {
    console.log(`Try to sneak by the party led by ${partyLeader.contents}`);
    state.dialogOpen = false;
    drawScene();
  }
  drawDialogButton(
    'Sneak', sneak,
    dialogX + dialogWidth - 20 - buttonWidth, buttonBottomMargin,
    buttonWidth, buttonHeight,
    tinycolor(SUNGLOW_HEX).darken(20).toString(), SUNGLOW_HEX, WHITE_HEX
  );
}

function onCavernInteractTreasurePopUpDialog(loot) {
  let {dialogX, dialogY, dialogHeight, dialogWidth, dialogCenter} = drawDialogBox();
  // draw text
  context.save();
  context.textAlign = 'center';
  context.fillStyle = BLACK_HEX;
  context.font = '20px Times New Roman';
  context.fillText(
    'In this cavern there are:',
    canvas.width / 2, dialogY + 30
  );
  loot.forEach((item, index) => {
    // drawCard
    prepareCard(item);
    context.drawImage(cardBuffer, (canvas.width / 2) - (CARD_WIDTH+10)*index, dialogY + 45, CARD_WIDTH, CARD_HEIGHT);
  });
  context.fillText(
    'What do you do?',
    dialogCenter, dialogY + dialogHeight - 80
  );
  context.restore();
  // buttons and button actions
  const buttonHeight = 40, buttonWidth = 130, buttonSpacing = 12;
  const buttonBottomMargin = dialogHeight + dialogY - (buttonHeight + 20);
  function pickUpItem(item) {
    console.log(`Try and pick up ${item.contents}`);
    drawScene();
  }
  loot.forEach((item, index) => {
    drawDialogButton(
      `Gather ${item.contents}`, () => pickUpItem(item),
      dialogX + dialogWidth - (buttonWidth+buttonSpacing)*(index+1), buttonBottomMargin,
      buttonWidth, buttonHeight,
      INDIGO_HEX, tinycolor(INDIGO_HEX).lighten(20).toString(), WHITE_HEX
    );
  });
  function ignoreAll() {
    console.log(`Ignore all items`);
    state.dialogOpen = false;
    drawScene();
  }
  drawDialogButton('Ignore All', ignoreAll,
    dialogX + dialogWidth - ((buttonWidth+buttonSpacing)*(loot.length+1)), buttonBottomMargin,
    buttonWidth, buttonHeight
  );
}

function drawDialogButton(text, effect, x = (canvas.width/2) - 50, y = (canvas.height/2) - 20, width = 100, height = 40, fillColor, borderColor, textColor) {
  width = width || 100;
  height = height || 40;
  fillColor = fillColor || RUSTYRED_HEX;
  borderColor = borderColor || LIGHTCRIMSON_HEX;
  textColor = textColor || WHITE_HEX;
  context.save()
  // red rectangle
  context.beginPath();
  context.lineWidth = '6';
  context.fillStyle = fillColor;
  context.strokeStyle = borderColor;
  context.rect(x, y, width, height);
  context.stroke();
  context.fill();
  context.closePath();
  // text
  context.textAlign = 'center';
  context.fillStyle = textColor;
  let fontSize = (height / 2) + 4;
  context.font = fontSize + 'px Times New Roman';
  context.fillText(text, x + width / 2, y + fontSize);
  context.restore();
  state.clickable.push({id: text, x, y, width, height, effect});
}
