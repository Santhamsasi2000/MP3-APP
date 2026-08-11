import axios from 'axios';

const BASE_URL = 'http://192.168.0.108:5000/api';

// Get all songs
export const getSongs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/songs`);
    return response.data.songs || [];
  } catch (error) {
    console.error('Error fetching songs:', error.message);
    return [];
  }
};

// Get recently added songs
export const getRecentSongs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/recent`);
    return response.data.songs || [];
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

// Get most played
export const getMostPlayed = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/most-played`);
    return response.data.songs || [];
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

// Get music directors
export const getDirectors = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/meta/directors`);
    return response.data.directors || [];
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

// Get movies/albums
export const getMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/meta/movies`);
    return response.data.movies || [];
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

// Get streaming URL for a song
export const getStreamUrl = async (songId) => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/${songId}/stream`);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
};

// Upload song
export const uploadSong = async (fileUri, fileName, metadata, onProgress) => {
  try {
    const formData = new FormData();

    formData.append('song', {
      uri: fileUri,
      name: fileName,
      type: 'audio/mpeg',
    });

    formData.append('title', metadata.title || fileName);
    formData.append('artist', metadata.artist || 'Unknown');
    formData.append('album', metadata.album || 'Unknown');
    formData.append('musicDirector', metadata.musicDirector || 'Unknown');
    formData.append('movieName', metadata.movieName || '');
    formData.append('category', metadata.category || 'song');

    const response = await axios.post(`${BASE_URL}/songs/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
      timeout: 60000,
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error.message);
    if (error.response) return error.response.data;
    return { success: false, error: error.message };
  }
};

// Add this function
export const searchSongs = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/songs/search?q=${query}`);
    return response.data.songs || [];
  } catch (error) {
    console.error('Search error:', error.message);
    return [];
  }
};