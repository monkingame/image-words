//NOTE:mobile migrate DONE

import md5 from 'md5';
import { Base64 } from 'js-base64';

const path = require('path');


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
  // const Buffer = require('buffer/').Buffer;
  // const buffer = new Buffer(base64Zombie, 'base64');
  const Buffer = require('buffer').Buffer;
  const buffer = new Buffer(base64Zombie, 'base64');

  return buffer;
}
export { base642Buffer };

// function md5(buffer) {
//   return require('crypto').createHash('md5').update(buffer).digest('hex');
// }
// export { md5 };

function genMd5Name(filename, base64) {
  //TODO:这里的Buffer有何用？
  // const Buffer = require('buffer/').Buffer;
  return md5(base642Buffer(base64)) + getExt(filename);
}
export { genMd5Name };

function addJpegBase64Header(puredata) {
  return `data:image/jpeg;base64,${puredata}`;
}
export { addJpegBase64Header };


function getDecode(base64) {
  if (!base64) return null;
  return Base64.decode(base64);
}
export { getDecode };

function getFilenameNoExt(filename) {
  if (!filename) return null;
  return path.parse(filename).name;
}
export { getFilenameNoExt };
