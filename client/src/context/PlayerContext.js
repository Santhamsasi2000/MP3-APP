import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { getStreamUrl } from '../services/api';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef(null);

  // Setup audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Audio setup error:', error);
      }
    };
    setupAudio();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Playback status update
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  // Play a song
  const playSong = async (song) => {
    try {
      setIsLoading(true);
      setCurrentSong(song);

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      console.log('🎵 Playing:', song.title);

      // Get streaming URL
      const data = await getStreamUrl(song._id || song.id);

      if (!data || !data.streamUrl) {
        console.error('No stream URL');
        setIsLoading(false);
        return;
      }

      // Create sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.streamUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Play error:', error);
      setIsLoading(false);
    }
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  // Stop and clear
  const stopSong = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  // Seek to position
  const seekTo = async (millis) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(millis);
    }
  };

  const value = {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    playSong,
    togglePlayPause,
    stopSong,
    seekTo,
    sound: soundRef.current,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};