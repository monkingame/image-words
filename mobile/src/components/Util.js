
import { saveLocalKeyValue, getLocalKey, removeLocalKey } from '../util/LocalStore';
import { EncryptAESWithKey, DecryptAESWithKey } from '../util/crypto';


//////////////////////////////////////////////
//eula

// const genEulaFlagKey = () => (`${APP_NAME}EULA#FLAG`);
const LOCAL_EULA_KEY = `LOCAL_EULA_KEY`;

export const saveEulaFlag = async () => {
  // const key = genEulaFlagKey();
  try {
    // await AsyncStorage.setItem(key, 'true');
    await saveLocalKeyValue(LOCAL_EULA_KEY, 'true');
  } catch (err) {
    // console.log('Eula出错');
  }
}

export const getEulaFlag = async () => {
  // const key = genEulaFlagKey();
  let value = null;
  try {
    // value = await AsyncStorage.getItem(key);
    value = await getLocalKey(LOCAL_EULA_KEY);
  } catch (err) {
    // console.log('赞读出错');
  }
  return (value === "true");
}


