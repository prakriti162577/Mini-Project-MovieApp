import Constants from 'expo-constants';

const CONFIG = {
  OMDB_API_KEY:
    Constants.expoConfig?.extra?.OMDB_API_KEY ??
    Constants.manifest?.extra?.OMDB_API_KEY,
};

export default CONFIG;