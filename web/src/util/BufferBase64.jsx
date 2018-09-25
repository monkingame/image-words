var path = require('path');

function getExt(filename) {
  return path.extname(filename).toLowerCase();
}
export { getExt };


//TODO:png tif gif file test
function getBase64Header(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!ext) return null;
  let extNoDot = ext;
  if (ext.indexOf('.') >= 0) {
    //TODO:substring faster?
    extNoDot = ext.replace('.', '');
  }

  return `data:image/${extNoDot};base64,`;
}
export { getBase64Header };

function buffer2Base64(buffer, filename) {
  if (!Buffer.isBuffer(buffer)) {
    return null;
  }
  const header = getBase64Header(filename);
  if (!header) return null;
  return header + (new Buffer(buffer).toString('base64'));
}
export { buffer2Base64 };



function base642Buffer(base64) {
  const header = /^data:([A-Za-z-+/]+);base64,/;
  // const filehead = /^data:image\/png;base64,$/;//why NOT?
  if (!header.test(base64)) {
    return null;
  }
  const base64Zombie = base64.replace(header, '');
  const buffer = new Buffer(base64Zombie, 'base64');
  return buffer;
}
export { base642Buffer };

function md5(buffer) {
  return require('crypto').createHash('md5').update(buffer).digest('hex');
}
export { md5 };

function genMd5Name(filename, base64) {
  return md5(base642Buffer(base64)) + getExt(filename);
}
export { genMd5Name };
