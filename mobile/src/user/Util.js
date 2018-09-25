
import { saveLocalKeyValue, getLocalKey, removeLocalKey } from '../util/LocalStore';
import { EncryptAESWithKey, DecryptAESWithKey } from '../util/crypto';


//////////////////////////////////////////////
//logined user
const LOCAL_LOGINED_USER_KEY = `LOCAL_LOGINED_USER_KEY`;

//metadata loginedUser
//是resolver的loginedUser和GQLQuery的QUERY_METADATA
export const setLocalStorageLoginedUser = async (loginedUser, metadata) => {
  if (!metadata) return;
  const { clientKey } = metadata;
  if (!clientKey) return;

  // console.log('setLocalStorageLoginedUser : ', loginedUser, metadata);
  if (loginedUser) {
    await saveLocalKeyValue(LOCAL_LOGINED_USER_KEY, EncryptAESWithKey(JSON.stringify(loginedUser), clientKey));
  } else {
    await removeLocalKey(LOCAL_LOGINED_USER_KEY);
  }
}

export const getLocalStorageLoginedUser = async (metadata) => {
  if (!metadata) return null;
  const { clientKey } = metadata;
  if (!clientKey) return null;

  const userCipher = await getLocalKey(LOCAL_LOGINED_USER_KEY);
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

