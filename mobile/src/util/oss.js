
// TODO: 在react-native下不能使用

import { buffer2Base64 } from '../util/BufferBase64';
const co = require('co');
// var OSS = require('ali-oss').Wrapper;
// var oss = require('ali-oss');
const oss = require('ali-oss/dist/aliyun-oss-sdk.js');
// var oss = require('http://gosspublic.alicdn.com/aliyun-oss-sdk.min.js');
// var oss = require('../util/aliyun-oss-sdk.min.js');

function getBase64OssFile(stsOption, filename) {
  if (!stsOption) return null;

  const client = oss(stsOption);
  // console.log('getBase64OssFile 从服务器拉取数据，要避免重复操作： ', filename);

  return co(function* () {
    var result = yield client.get(filename);
    // dataproc(buffer2Base64(result.content, filename));
    return buffer2Base64(result.content, filename);
  });
}
export { getBase64OssFile };


function stsSignatureUrl(stsOption, filename) {
  const client = oss(stsOption);
  // const client = new window.OSS(stsOption);
  return client.signatureUrl(filename, {
    expires: 3600,
    method: 'GET',
  });
}
export { stsSignatureUrl };

