
module.exports.base64ToBuffer = function (imageData) {
  const fileHead = /^data:([A-Za-z-+\/]+);base64,/;
  // const filehead = /^data:image\/png;base64,$/;//why NOT?
  if (!fileHead.test(imageData)) {
    return null;
  }
  const base64Data = imageData.replace(fileHead, '');
  const bitmap = new Buffer(base64Data, 'base64');
  return bitmap;
}

