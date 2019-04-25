
module.exports = {
  tintImage,
  drawRectangleAroundTarget,
  prepareCard,
}

const {
  context,
  cardBuffer,
  cardBufferContext,
  BLACK_HEX,
  RUSTYRED_HEX,
  INDIGO_HEX,
  SUNGLOW_HEX,
  tintBuffer,
  tintBufferContext,
  WHITE_HEX,
} = require('gameConstants');

const { state } = require('state');

const { requireImage } = require('images');

function tintImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, color = RUSTYRED_HEX || '#dd2d4a', targetContext = context) {
  if (!sWidth) sWidth = img.width;
  if (!sHeight) sHeight = img.height;
  // from: https://stackoverflow.com/a/4231508/
  tintBuffer.width = dWidth;
  tintBuffer.height = dHeight;
  // fill offscreen tintBuffer with the tint color
  tintBufferContext.fillStyle = color;
  tintBufferContext.fillRect(0,0,tintBuffer.width,tintBuffer.height);
  // destination atop makes a result with an alpha channel identical to img, but with all pixels retaining their original color *as far as I can tell*
  tintBufferContext.globalCompositeOperation = "destination-atop";
  tintBufferContext.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
  // to tint the image, draw it first
  targetContext.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  //then set the global alpha to the amount that you want to tint it, and draw the tintBuffer directly on top of it.
  targetContext.globalAlpha = 0.7;
  targetContext.drawImage(tintBuffer, dx, dy);
  targetContext.globalAlpha = 1;
}

// use this in development for solving drawing placement problems
function drawRectangleAroundTarget(dx, dy, dWidth, dHeight, targetContext = context) {
  targetContext.save();
  targetContext.strokeStyle = BLACK_HEX;
  targetContext.beginPath();
  targetContext.rect(dx, dy, dWidth, dHeight);
  targetContext.stroke();
  targetContext.closePath();
  targetContext.restore();
}

function prepareCard(info, background, backgroundColor) {
  const x = 0, y = 0;
  const cardWidth = 250, cardHeight = 195;
  const cardContentX = x + 28, cardContentY = y + 22;
  const cardContentWidth = 200, cardContentHeight = 150;
  cardBuffer.width = cardWidth, cardBuffer.height = cardHeight;
  if (!background) background = requireImage('gfx/decorative-border.png');
  if (!backgroundColor) backgroundColor = INDIGO_HEX;
  if (info.partyLeader) backgroundColor = SUNGLOW_HEX;
  cardBufferContext.save();
  // Draw card background
  cardBufferContext.beginPath();
  cardBufferContext.lineWidth = 3;
  cardBufferContext.fillStyle = WHITE_HEX;
  cardBufferContext.rect(x, y, cardWidth, cardHeight);
  // cardBufferContext.stroke();
  cardBufferContext.fill();
  cardBufferContext.closePath();
  cardBufferContext.restore();
  // null sWidth and sHeight auto sets img to full src img height and width
  tintImage(background, 0, 0, null, null, x+2, y+2, cardWidth-4, cardHeight-4, backgroundColor, cardBufferContext);
  // draw text
  cardBufferContext.save();
  let fontSize = 20;
  cardBufferContext.textAlign = 'left';
  cardBufferContext.fillStyle = INDIGO_HEX;
  cardBufferContext.font = `bolder small-caps ${fontSize}px Times New Roman serif`;
  cardBufferContext.fillText(info.contents.toUpperCase(), cardContentX, cardContentY + fontSize);
  fontSize = 14;
  cardBufferContext.font = `${fontSize}px Arial sans-serif`;
  let firstLine = info.description, secondLine, thirdLine;
  if (info.description.length < 18) {
    cardBufferContext.fillText(firstLine, cardContentX, cardContentY + (fontSize)*3);
  } else {
    var descriptionList = info.description.match(/.{18}\w*|.*/g);
    descriptionList.forEach(function(entry, index) {
      descriptionList[index] = entry.trim();
    });
    firstLine = descriptionList[0] ? descriptionList[0] : '';
    secondLine = descriptionList[1] ? descriptionList[1] : '';
    thirdLine = descriptionList[2] ? descriptionList[2] : '';
    cardBufferContext.fillText(firstLine, cardContentX, cardContentY + (fontSize)*3);
    cardBufferContext.fillText(secondLine, cardContentX, cardContentY + (fontSize)*4);
    cardBufferContext.fillText(thirdLine, cardContentX, cardContentY + (fontSize)*5);
  }
  fontSize = 14;
  let verticalSpacing = 17;
  cardBufferContext.font = `bolder small-caps ${fontSize}px Arial sans-serif`;
  let weightOrStrength = {weight: info.weight || 0};

  const image = requireImage(info.imageSrc);
  const sx = info.stillImage.x, sy = info.stillImage.y;
  const sWidth = info.widthFrame, sHeight = info.heightFrame;
  let dWidth = (state.gridWidth/2) * (info.scale*1.35 || 1.35), dHeight = (dWidth * sHeight / sWidth);
  let dx, dy;
  const col1 = cardContentX + 55, colSpacing = 2, col2 = cardContentX + cardContentWidth - 24;
  const row1 = cardContentY + 85, row2 = row1 + verticalSpacing;
  const row3 = row1 + verticalSpacing*2, row4 = row1 + verticalSpacing*3.5;
  const emdash = '\u2014';
  if (info.creature) {
    cardBufferContext.textAlign = 'right';
    cardBufferContext.fillText(`friendly:`, col1, row1);
    cardBufferContext.fillText(`neutral:`, col1, row2);
    cardBufferContext.fillText(`hostile:`, col1, row3);
    fontSize = 18;
    cardBufferContext.font = `small-caps ${fontSize}px Arial sans-serif`;
    cardBufferContext.textAlign = 'left';
    cardBufferContext.fillText(`${info.friendRoll.min || emdash} - ${info.friendRoll.max || emdash}`, col1 + colSpacing, row1);
    cardBufferContext.fillText(`${info.neutralRoll.min || emdash} - ${info.neutralRoll.max || emdash}`, col1 + colSpacing, row2);
    cardBufferContext.fillText(`${info.hostileRoll.min || emdash} - ${info.hostileRoll.max || emdash}`, col1 + colSpacing, row3);
    weightOrStrength = {strength: info.strength};
    dx = cardContentX + cardContentWidth - 35 - dWidth/2;
    dy = cardContentY + 30 - dHeight/2;
    tintImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, 'rgba(0, 0, 0, 0)', cardBufferContext);
  } else {
    dWidth = (state.gridWidth/2) * (info.scale*3 || 3), dHeight = (dWidth * sHeight / sWidth);
    dx = cardContentX + cardContentWidth/2 - dWidth/2, dy = cardContentY + 15 + cardContentHeight/2 - dHeight/2;
    tintImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, 'rgba(0, 0, 0, 0)', cardBufferContext);
  }
  fontSize = 14;
  cardBufferContext.font = `bolder small-caps ${fontSize}px Arial sans-serif`;
  const key = Object.keys(weightOrStrength)[0];
  cardBufferContext.textAlign = 'right';
  cardBufferContext.fillText(`value:`, col2 - colSpacing*3, row4);
  cardBufferContext.fillText(`${key}:`, col1 + colSpacing*3, row4);
  if (info.creature) {
    cardBufferContext.fillText(`attack:`, col2 - colSpacing, row1);
    cardBufferContext.fillText(`magic:`, col2 - colSpacing, row2);
  }
  fontSize = 18;
  cardBufferContext.font = `${fontSize}px Arial sans-serif`;
  cardBufferContext.textAlign = 'left';
  cardBufferContext.fillText(`${info.value}`, col2 - colSpacing*2, row4);
  cardBufferContext.fillText(`${weightOrStrength[key]}`, col1 + colSpacing*4, row4);
  if (info.creature) {
    cardBufferContext.fillText(`${info.attack}`, col2, row1);
    cardBufferContext.fillText(`${info.magic}`, col2, row2);
  }
  cardBufferContext.restore();
}
