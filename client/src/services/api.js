import axios from 'axios';
import { BASE_URL } from '../config/api.config';

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

// Get most played songs
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

// Get songs by director
export const getSongsByDirector = async (director) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/songs/director/${encodeURIComponent(director)}`
    );
    return response.data.songs || [];
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

// Get songs by movie
export const getSongsByMovie = async (movie) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/songs/movie/${encodeURIComponent(movie)}`
    );
    return response.data.songs || [];
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
    console.error('Error getting stream URL:', error.message);
    return null;
  }
};

// Search songs
export const searchSongs = async (query) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/songs/search?q=${encodeURIComponent(query)}`
    );
    return response.data.songs || [];
  } catch (error) {
    console.error('Search error:', error.message);
    return [];
  }
};

// Toggle favorite
export const toggleFavorite = async (songId) => {
  try {
    const response = await axios.post(`${BASE_URL}/songs/${songId}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Favorite error:', error.message);
    return null;
  }
};

// Get statistics
export const getStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/stats`);
    return response.data.stats || null;
  } catch (error) {
    console.error('Stats error:', error.message);
    return null;
  }
};

// Upload song from mobile
export const uploadSong = async (fileUri, fileName, metadata, onProgress) => {
  try {
    const formData = new FormData();

    // Add file
    formData.append('song', {
      uri: fileUri,
      name: fileName,
      type: 'audio/mpeg',
    });

    // Add metadata
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
      timeout: 120000, // 2 minutes for large files
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error.message);
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete song
export const deleteSong = async (songId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/songs/${songId}`);
    return response.data;
  } catch (error) {
    console.error('Delete error:', error.message);
    return { success: false, error: error.message };
  }
};

// Export BASE_URL for other files that need it
export { BASE_URL };
