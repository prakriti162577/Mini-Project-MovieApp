// services/omdbService.js
import { OMDB_API_KEY } from '@env';

export const searchOMDB = async (query) => {
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${query}`);
    const data = await response.json();
    if (data.Response === 'True') {
      return data.Search;
    } else {
      console.warn('OMDB error:', data.Error);
      return [];
    }
  } catch (error) {
    console.error('OMDB fetch failed:', error);
    return [];
  }
};

export const getOMDBDetails = async (imdbID) => {
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OMDB detail fetch failed:', error);
    return null;
  }
};