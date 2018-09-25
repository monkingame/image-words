"use strict";

const co = require('co');
const oss = require('ali-oss');



const STS = oss.STS;

const OSS_REGEIN = process.env.OSS_REGEIN;
const OSS_ENDPOINT = process.env.OSS_ENDPOINT;
const OSS_ENDPOINT_INERNAL = process.env.OSS_ENDPOINT_INERNAL;
const OSS_BUCKET_IMAGE = process.env.OSS_BUCKET_IMAGE;
const ROLE_ARN = process.env.ROLE_ARN;

const EXPIRE_TIME = 3600;//seconds

module.exports.POLICY_READ = `{
  "Statement": [
    {
      "Action": [
        "oss:GetObject"
      ],
      "Effect": "Allow",
      "Resource": ["acs:oss:*:*:${OSS_BUCKET_IMAGE}/*"]
    }
  ],
  "Version": "1"
}
`;


//NOTE:此方法的token只能在API server端使用，一定不要发送到App/Web端
module.exports.saveFile2OSS = function (filename, buffer) {
  const client = oss({
    accessKeyId: process.env.OSS_KEY_ID,
    accessKeySecret: process.env.OSS_KEY_SECRET,
    bucket: OSS_BUCKET_IMAGE,
    region: OSS_REGEIN,
    secure: true
  });

  return co(function* () {
    var result = yield client.put(filename, buffer);
    const { name, url } = result;
    // dataproc({ filename: name, fileurl: url });
    // return { filename: name, fileurl: url };
    return { name, url };
  })
}

//NOTE:危险注意！！！ 如果policy未定义，那么assumeRole居然会按照最高权限去获取角色！
module.exports.genToken = function (policy) {
  if (!policy) {
    return null;
  }

  const client = new STS({
    accessKeyId: process.env.STS_KEY_ID,
    accessKeySecret: process.env.STS_KEY_SECRET
  });

  return co(function* () {
    var result = yield client.assumeRole(ROLE_ARN, policy, EXPIRE_TIME);
    // res.set('Access-Control-Allow-Origin', '*');
    // res.set('Access-Control-Allow-METHOD', 'GET');
    //TODO:注意token各key的大小写！
    const token = {
      accessKeyId: result.credentials.AccessKeyId,
      accessKeySecret: result.credentials.AccessKeySecret,
      // SecurityToken: result.credentials.SecurityToken,
      stsToken: result.credentials.SecurityToken,
      // Expiration: result.credentials.Expiration,
      region: OSS_REGEIN,
      bucket: OSS_BUCKET_IMAGE,
      secure: true
    };
    return token;
  })
}

module.exports.stsSignatureUrl = function (stsOption, filename) {
  return oss(stsOption).signatureUrl(filename, {
    expires: 3600,
    method: 'GET',
  });
}


//NOTE: TODO:
//TODO: 危险注意！！！
//TODO: 仅用作调试用！
//TODO: 这是full权限用户！
//TODO: 慎用！
//TODO:NOTE:调试需要，暂时关闭正常genToken，调用genTokenDanger。
//TODO:在某些机器上，经常出现Error: connect ETIMEDOUT ip.ip.ip.ip:port
module.exports.genTokenDanger = async function (policy) {
  const tokenDanger = {
    accessKeyId: process.env.OSS_KEY_ID,
    accessKeySecret: process.env.OSS_KEY_SECRET,
    stsToken: null,
    region: OSS_REGEIN,
    bucket: OSS_BUCKET_IMAGE,
    secure: true
  };
  return tokenDanger;
}

