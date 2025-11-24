import axios from 'axios';
const getApiBaseUrl = () => {
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';
  if (isDevelopment) return 'http://localhost:8000/api';
  return import.meta.env.VITE_API_URL || 'https://faresgames.onrender.com/api';
};
const API_BASE_URL = getApiBaseUrl();
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};
export const getUser = async (email) => {
  const response = await api.get(`/users/${email}`);
  return response.data;
};
export const verifyPassword = async (email, password) => {
  const response = await api.post('/users/verify-password', null, {
    params: { email, password }
  });
  return response.data;
};
export const getAllGames = async (limit = 252, offset = 0) => {
  const response = await api.get('/games/', { params: { limit, offset } });
  return response.data;
};
export const searchGames = async (query) => {
  const response = await api.get('/games/search', { params: { q: query } });
  return response.data;
};
export const getGameDetails = async (gameId) => {
  const response = await api.get(`/games/${gameId}`);
  return response.data;
};
export const getGamesByFilter = async (filters) => {
  const response = await api.get('/games/filter/by-criteria', { params: filters });
  return response.data;
};
export const addRating = async (ratingData) => {
  const response = await api.post('/ratings/', ratingData);
  return response.data;
};
export const getUserRatings = async (email) => {
  const response = await api.get(`/ratings/user/${email}`);
  return response.data;
};
export const deleteRating = async (userEmail, gameId, platformName) => {
  const response = await api.delete('/ratings/', {
    params: { user_email: userEmail, game_id: gameId, platform_name: platformName },
  });
  return response.data;
};
export const getTopGames = async (filters) => {
  const response = await api.get('/analytics/top-games', { params: filters });
  return response.data;
};
export const getTopGamesByMoby = async (filters) => {
  const response = await api.get('/analytics/top-games-by-moby', { params: filters });
  return response.data;
};
export const getTopDevelopers = async (genre = null, limit = 5) => {
  const response = await api.get('/analytics/top-developers', {
    params: { genre, limit },
  });
  return response.data;
};
export const getDreamGame = async () => {
  const response = await api.get('/analytics/dream-game');
  return response.data;
};
export const getTopDirectors = async (limit = 5) => {
  const response = await api.get('/analytics/top-directors', { params: { limit } });
  return response.data;
};
export const getTopCollaborations = async (limit = 5) => {
  const response = await api.get('/analytics/top-collaborations', { params: { limit } });
  return response.data;
};
export const getPlatformStats = async () => {
  const response = await api.get('/analytics/platform-stats');
  return response.data;
};
export const getPlatforms = async () => {
  const response = await api.get('/metadata/platforms');
  return response.data;
};
export const getGenres = async () => {
  const response = await api.get('/metadata/genres');
  return response.data;
};
export const getSettings = async () => {
  const response = await api.get('/metadata/settings');
  return response.data;
};
export const getDevelopers = async () => {
  const response = await api.get('/metadata/developers');
  return response.data;
};
export const getPublishers = async () => {
  const response = await api.get('/metadata/publishers');
  return response.data;
};
export const getGamesList = async () => {
  const response = await api.get('/metadata/games');
  return response.data;
};
export const getReleaseYears = async () => {
  const response = await api.get('/metadata/years');
  return response.data;
};
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};
export const getGamePlatforms = async (gameId) => {
  const response = await api.get(`/games/${gameId}/platforms`);
  return response.data;
};
export default api;