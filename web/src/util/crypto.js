
export const EncryptAESWithKey = (plain, key) => {
  const CryptoJS = require("crypto-js");
  // Encrypt
  const ciphertext = CryptoJS.AES.encrypt(plain, key);
  // console.log(ciphertext);
  // console.log(ciphertext.toString());
  return ciphertext.toString();
}

export const DecryptAESWithKey = (cipher, key) => {
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

