
//NOTE:key要写入.env文件，不能上传到git服务器

const EncryptAESWithKey = (plain, key) => {
  const CryptoJS = require("crypto-js");
  // Encrypt
  const ciphertext = CryptoJS.AES.encrypt(plain, key);
  // console.log(ciphertext);
  // console.log(ciphertext.toString());
  return ciphertext.toString();
}

const DecryptAESWithKey = (cipher, key) => {
  if (!cipher) return null;
  const CryptoJS = require("crypto-js");
  try {
    // Decrypt
    const bytes = CryptoJS.AES.decrypt(cipher, key);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(plain);
    return plain;
  } catch (ex) {
    // console.log(ex);
    return null;
  }
}


const EncryptAESServer = (plain) => EncryptAESWithKey(plain, process.env.SECRET_SERVER_SIDE_KEY);
const DecryptAESServer = (cipher) => DecryptAESWithKey(cipher, process.env.SECRET_SERVER_SIDE_KEY);

// const EncryptAESClient = (plain) => EncryptAESWithKey(plain, process.env.SECRET_CLIENT_SIDE_KEY);
// const DecryptAESClient = (cipher) => DecryptAESWithKey(cipher, process.env.SECRET_CLIENT_SIDE_KEY);

module.exports = {
  EncryptAESServer,
  DecryptAESServer,
  // EncryptAESClient,
  // DecryptAESClient,
};
