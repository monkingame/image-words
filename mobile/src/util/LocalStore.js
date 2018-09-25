
import { AsyncStorage } from 'react-native';
import { EncryptAESWithKey, DecryptAESWithKey } from './crypto';



export const saveLocalKeyValue = async (key, value) => {
  // console.log('saveLocalKeyValue :', key, value);
  await AsyncStorage.setItem(key, value);
}

export const getLocalKey = async (key) => {
  const value = await AsyncStorage.getItem(key);
  // console.log('getLocalKey 1: ', key, value)
  return value;
}

export const removeLocalKey = async (key) => {
  await AsyncStorage.removeItem(key);
}

