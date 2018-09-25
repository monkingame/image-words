
import { Platform, PermissionsAndroid, } from 'react-native';

export const getAndroidPermission = async () => {
  if (Platform.OS === 'android') {
    const allowedStorage =
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
    return allowedStorage === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

