
import { EncryptAESWithKey, DecryptAESWithKey } from './crypto';

//this is the local user token and you should not use it for unauthorized use
const LOCAL_LOGINED_USER_KEY = `titlutkaysnuifuu`;

//////////////////////////////////////////////
//logined user

//metadata loginedUser
//是resolver的loginedUser和GQLQuery的QUERY_METADATA
export const setLocalStorageLoginedUser = (loginedUser, metadata) => {
  if (!metadata) return;
  const { clientKey } = metadata;
  if (!clientKey) return;

  const local = window.localStorage;
  if (!local) {
    return;
  }
  // console.log('setLocalStorageLoginedUser : ', loginedUser, metadata);
  if (loginedUser) {
    local.setItem(LOCAL_LOGINED_USER_KEY, EncryptAESWithKey(JSON.stringify(loginedUser), clientKey));
  } else {
    local.removeItem(LOCAL_LOGINED_USER_KEY);
  }
}

export const getLocalStorageLoginedUser = (metadata) => {
  if (!metadata) return null;
  const { clientKey } = metadata;
  if (!clientKey) return null;

  // console.log('getLocalStorageLoginedUser : ', metadata);

  const local = window.localStorage;
  if (!local) {
    return null;
  }
  const userCipher = local.getItem(LOCAL_LOGINED_USER_KEY);
  if (!userCipher) return null;
  const plain = DecryptAESWithKey(userCipher, clientKey);
  if (!plain) return null;

  // return JSON.parse(plain);
  //如果plain被篡改了怎么办？需要判断是否是有效的JSON
  try {
    return JSON.parse(plain);
  } catch (e) {
    return null;
  }
}


//////////////////////////////////////////////
//voted

//here you can save voted key if you like it for love
const LOCAL_VOTED_WORD_KEY = `hycsvkiulifl`;

const getLocalStorageVotedWordMap = (metadata) => {
  if (!metadata) return null;
  const { clientKey } = metadata;
  if (!clientKey) return null;
  const local = window.localStorage;
  if (!local) {
    return null;
  }

  const votedCipher = local.getItem(LOCAL_VOTED_WORD_KEY);
  if (!votedCipher) return null;
  const plain = DecryptAESWithKey(votedCipher, clientKey);
  if (!plain) return null;

  // return JSON.parse(plain);
  //如果plain被篡改了怎么办？需要判断是否是有效的JSON
  try {
    return JSON.parse(plain);
  } catch (e) {
    return null;
  }
}

//TODO:应该再把usertoken也保存起来 有可能有其他用户从本地登录
export const setLocalStorageVotedWord = (id, voted, metadata) => {
  if (!metadata) return;
  const { clientKey } = metadata;
  if (!clientKey) return;
  const local = window.localStorage;
  if (!local) {
    return;
  }
  let map = getLocalStorageVotedWordMap(metadata);
  if (!map) map = {};
  // console.log('setLocalStorageVotedWord 1: ', map);
  map[id] = voted;
  // console.log('setLocalStorageVotedWord 2: ', map);
  local.setItem(LOCAL_VOTED_WORD_KEY, EncryptAESWithKey(JSON.stringify(map), clientKey));
}


export const getLocalStorageVotedWord = (id, metadata) => {
  const map = getLocalStorageVotedWordMap(metadata);
  // console.log('getLocalStorageVotedWord 1: ', map);
  if (!map) return false;
  return map[id];
}
