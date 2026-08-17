import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
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

export const REPEAT_MODES = {
  ORDER: 'order',
  REPEAT_ONE: 'repeat_one',
  SHUFFLE: 'shuffle',
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState(REPEAT_MODES.ORDER);
  
  const soundRef = useRef(null);
  const repeatModeRef = useRef(repeatMode);
  const playlistRef = useRef(playlist);
  const currentIndexRef = useRef(currentIndex);
  const isChangingSongRef = useRef(false); // ⭐ Prevent double play

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

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

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      
      if (status.durationMillis) {
        setDuration(status.durationMillis);
      }
      
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish && !isChangingSongRef.current) {
        console.log('🎵 Song finished!');
        handleSongFinishInternal();
      }
    }
  }, []);

  const handleSongFinishInternal = () => {
    const currentMode = repeatModeRef.current;
    console.log('Current mode:', currentMode);

    if (currentMode === REPEAT_MODES.REPEAT_ONE) {
      console.log('🔂 Repeat One');
      if (soundRef.current) {
        soundRef.current.setPositionAsync(0);
        soundRef.current.playAsync();
      }
    } else if (currentMode === REPEAT_MODES.SHUFFLE) {
      console.log('🔀 Shuffle - Playing random');
      playRandomSongInternal();
    } else {
      console.log('📋 Order - Playing next');
      playNextSongInternal(true);
    }
  };

  // ⭐ CRITICAL: Stop and unload current sound BEFORE playing new
  const stopCurrentSound = async () => {
    if (soundRef.current) {
      try {
        // Stop first
        await soundRef.current.stopAsync();
        // Then unload
        await soundRef.current.unloadAsync();
      } catch (err) {
        console.log('Stop/unload error:', err);
      }
      soundRef.current = null;
    }
  };

  // Internal play function
  const playSongInternal = async (song) => {
    try {
      // ⭐ Prevent multiple simultaneous plays
      if (isChangingSongRef.current) {
        console.log('⚠️ Already changing song, skipping');
        return;
      }
      
      isChangingSongRef.current = true;
      
      setIsLoading(true);
      setCurrentSong(song);
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);

      // ⭐ STOP old sound completely
      await stopCurrentSound();

      // Get stream URL
      const data = await getStreamUrl(song._id || song.id);

      if (!data || !data.streamUrl) {
        setIsLoading(false);
        isChangingSongRef.current = false;
        return;
      }

      // Create new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.streamUrl },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 100,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      setIsLoading(false);
      isChangingSongRef.current = false; // ⭐ Reset flag
      
    } catch (error) {
      console.error('Play error:', error);
      setIsLoading(false);
      isChangingSongRef.current = false;
    }
  };

  // Public play song
  const playSong = useCallback(async (song, songList = null) => {
    if (songList && songList.length > 0) {
      setPlaylist(songList);
      playlistRef.current = songList;
      const index = songList.findIndex(s => s._id === song._id);
      const newIndex = index >= 0 ? index : 0;
      setCurrentIndex(newIndex);
      currentIndexRef.current = newIndex;
    }

    await playSongInternal(song);
  }, []);

  // Next song
  const playNextSongInternal = (loop = true) => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;

    if (currentPlaylist.length === 0) return;

    let nextIndex = currentIdx + 1;
    
    if (nextIndex >= currentPlaylist.length) {
      if (loop) {
        nextIndex = 0;
      } else {
        return;
      }
    }

    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    playSongInternal(currentPlaylist[nextIndex]);
  };

  const playNextSong = useCallback(() => {
    playNextSongInternal(true);
  }, []);

  const playPreviousSong = useCallback(() => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;

    if (currentPlaylist.length === 0) return;

    let prevIndex = currentIdx - 1;
    
    if (prevIndex < 0) {
      prevIndex = currentPlaylist.length - 1;
    }

    setCurrentIndex(prevIndex);
    currentIndexRef.current = prevIndex;
    playSongInternal(currentPlaylist[prevIndex]);
  }, []);

  // ⭐ FIXED Random song
  const playRandomSongInternal = () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;

    if (currentPlaylist.length === 0) return;
    
    if (currentPlaylist.length === 1) {
      // Only one song, replay it
      playSongInternal(currentPlaylist[0]);
      return;
    }
    
    // Get truly random index (different from current)
    let randomIndex;
    let attempts = 0;
    do {
      randomIndex = Math.floor(Math.random() * currentPlaylist.length);
      attempts++;
      if (attempts > 10) break; // Safety
    } while (randomIndex === currentIdx);

    console.log(`🔀 Random: ${currentIdx} → ${randomIndex} (of ${currentPlaylist.length})`);
    
    setCurrentIndex(randomIndex);
    currentIndexRef.current = randomIndex;
    playSongInternal(currentPlaylist[randomIndex]);
  };

  const playRandomSong = useCallback(() => {
    playRandomSongInternal();
  }, []);

  // Play/Pause
  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.isPlaying) {
          console.log('⏸️ Pausing...');
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          console.log('▶️ Playing...');
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  }, []);

  const stopSong = useCallback(async () => {
    await stopCurrentSound();
    setCurrentSong(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  const seekTo = useCallback(async (millis) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(millis);
        setPosition(millis);
      } catch (error) {
        console.error('Seek error:', error);
      }
    }
  }, []);

  const cycleRepeatMode = useCallback(() => {
    const modes = [
      REPEAT_MODES.ORDER,
      REPEAT_MODES.REPEAT_ONE,
      REPEAT_MODES.SHUFFLE,
    ];
    const currentIdx = modes.indexOf(repeatMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    const newMode = modes[nextIdx];
    
    console.log('🔄 Repeat mode:', repeatMode, '→', newMode);
    setRepeatMode(newMode);
    repeatModeRef.current = newMode;
  }, [repeatMode]);

  const value = {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    playlist,
    currentIndex,
    repeatMode,
    playSong,
    playNextSong,
    playPreviousSong,
    togglePlayPause,
    stopSong,
    seekTo,
    cycleRepeatMode,
    setRepeatMode,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};