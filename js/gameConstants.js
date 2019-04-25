const canvas = document.getElementById("gameCanvas");
const compositeCanvas = document.createElement('canvas');
compositeCanvas.width = canvas.width;
compositeCanvas.height = canvas.height;
const context = canvas.getContext("2d");
const compositeContext = compositeCanvas.getContext("2d");
let windowInnerWidth = window.innerWidth, windowInnerHeight = window.innerHeight;
canvas.width = windowInnerWidth;
canvas.height = windowInnerHeight;
compositeCanvas.width = canvas.width;
compositeCanvas.height = canvas.height;

const cardBuffer = document.createElement('canvas');
const cardBufferContext = cardBuffer.getContext('2d');
const CARD_WIDTH = 230;
const CARD_HEIGHT = CARD_WIDTH * .75;
const GRID_WIDTH = 100;

const BOTTOM_MENU_HEIGHT = GRID_WIDTH/1.5;


// create offscreen buffer for image tinting,
const tintBuffer = document.createElement('canvas');
const tintBufferContext = tintBuffer.getContext('2d');

const INDIGO_HEX = '#540d6e';
const SUNGLOW_HEX = '#ffd23f';
const RUSTYRED_HEX = '#dd2d4a';
const LIGHTCRIMSON_HEX = '#f26a8d';
const AMARANTHPINK_HEX = '#f49cbb';
const WHITE_HEX = '#fafafa';
const GREY200_HEX = '#eeeeee';
const GREY500_HEX = '#9e9e9e';
const GREY700_HEX = '#616161';
const GREY900_HEX = '#212121';
const BLACK_HEX = '#191919';

const TILE_SHAPES = [
  'nesw', 'NeSw', 'nEsW', 'NESW',
  'NesW', 'neSW', 'nESw', 'NEsw',
  'NeSW', 'NEsW', 'nESW', 'NESw'
];

const LEADERSHIP_ORDER = ['giant', 'priest', 'man', 'wizard', 'hero', 'heroine', 'specter', 'sorcerer'];

module.exports = {
  AMARANTHPINK_HEX,
  BOTTOM_MENU_HEIGHT,
  BLACK_HEX,
  canvas,
  cardBuffer,
  cardBufferContext,
  CARD_HEIGHT,
  CARD_WIDTH,
  compositeCanvas,
  context,
  compositeContext,
  GRID_WIDTH,
  GREY200_HEX,
  GREY500_HEX,
  GREY700_HEX,
  GREY900_HEX,
  INDIGO_HEX,
  LEADERSHIP_ORDER,
  LIGHTCRIMSON_HEX,
  RUSTYRED_HEX,
  SUNGLOW_HEX,
  TILE_SHAPES,
  tintBuffer,
  tintBufferContext,
  WHITE_HEX,
};
