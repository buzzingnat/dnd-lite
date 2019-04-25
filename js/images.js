
const images = {};

function requireImage(imageSource) {
  // check if image is already loaded
  if (images[imageSource]) {
    return images[imageSource];
  }
  // if image isn't loaded, load it
  const image = new Image();
  image.src = imageSource;
  images[imageSource] = image;
  return images[imageSource];
}

module.exports = {
  requireImage,
};
