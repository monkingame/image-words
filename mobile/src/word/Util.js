
import { saveLocalKeyValue, getLocalKey, removeLocalKey } from '../util/LocalStore';
import { EncryptAESWithKey, DecryptAESWithKey } from '../util/crypto';

//////////////////////////////////////////////
//voted

const LOCAL_VOTED_WORD_KEY = `LOCAL_VOTED_WORD_KEY`;

// const getLocalStorageVotedWordMap = async (metadata) => {
//   if (!metadata) return null;
//   const { clientKey } = metadata;
//   if (!clientKey) return null;

//   const votedCipher = await getLocalKey(LOCAL_VOTED_WORD_KEY);
//   if (!votedCipher) return null;
//   const plain = DecryptAESWithKey(votedCipher, clientKey);
//   if (!plain) return null;

//   // return JSON.parse(plain);
//   //如果plain被篡改了怎么办？需要判断是否是有效的JSON
//   try {
//     return JSON.parse(plain);
//   } catch (e) {
//     // console.log('getLocalStorageVotedWordMap Error : ', e);
//     return null;
//   }
// }

let fastCacheMap = null;
const _loadFastCacheMap = async (clientKey) => {
  // console.log('_loadFastCacheMap fastCacheMap : ##################', );

  const votedCipher = await getLocalKey(LOCAL_VOTED_WORD_KEY);
  if (!votedCipher) return null;
  const plain = DecryptAESWithKey(votedCipher, clientKey);
  if (!plain) return null;

  // return JSON.parse(plain);
  //如果plain被篡改了怎么办？需要判断是否是有效的JSON
  try {
    return JSON.parse(plain);
  } catch (e) {
    // console.log('getLocalStorageVotedWordMap Error : ', e);
    return null;
  }
}

const getLocalStorageVotedWordMap = async (metadata) => {
  if (!metadata) return null;
  const { clientKey } = metadata;
  if (!clientKey) return null;

  // console.log('getLocalStorageVotedWordMap fastCacheMap : ', fastCacheMap);

  // if (!fastCacheMap) {
  //   const votedCipher = await getLocalKey(LOCAL_VOTED_WORD_KEY);
  //   if (!votedCipher) {
  //     return null;
  //   };
  //   const plain = DecryptAESWithKey(votedCipher, clientKey);
  //   if (!plain) {
  //     return null;
  //   }

  //   //如果plain被篡改了怎么办？需要判断是否是有效的JSON
  //   try {
  //     fastCacheMap = JSON.parse(plain);
  //   } catch (e) {
  //     // console.log('getLocalStorageVotedWordMap Error : ', e);
  //     fastCacheMap = null;
  //   }
  // }
  // console.log('getLocalStorageVotedWordMap fastCacheMap : ', fastCacheMap);
  if (!fastCacheMap) fastCacheMap = await _loadFastCacheMap(clientKey);
  // console.log('getLocalStorageVotedWordMap fastCacheMap : ', fastCacheMap);

  return fastCacheMap;
}

//TODO:应该再把usertoken也保存起来 有可能有其他用户从本地登录
export const setLocalStorageVotedWord = async (id, voted, metadata) => {
  // console.log('setLocalStorageVotedWord 0: ', id, voted, metadata);
  if (!metadata) return;

  const { clientKey } = metadata;
  if (!clientKey) return;
  let map = await getLocalStorageVotedWordMap(metadata);

  if (!map) map = {};
  if (voted) {
    map[id] = voted;
  } else {
    delete map[id];
  }
  await saveLocalKeyValue(LOCAL_VOTED_WORD_KEY, EncryptAESWithKey(JSON.stringify(map), clientKey));
}


export const getLocalStorageVotedWord = async (id, metadata) => {
  const map = await getLocalStorageVotedWordMap(metadata);
  if (!map) return false;
  return map[id];
}

