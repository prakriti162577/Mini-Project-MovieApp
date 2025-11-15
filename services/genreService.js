// services/genreService.js
import axios from 'axios';

const TMDB_API_KEY = '53a3cc62f04743e4c340e7393c8b9f5b';
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

export const fetchTVGenres = async () => {
  const response = await tmdb.get('/genre/tv/list');
  return response.data.genres;
};

export const fetchMovieGenres = async () => {
  const response = await tmdb.get('/genre/movie/list');
  return response.data.genres;
};