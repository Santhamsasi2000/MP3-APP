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

  // Keep refs updated (for use in callbacks)
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

  // ⭐ FAST position updates (100ms)
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      // Update position FAST
      setPosition(status.positionMillis || 0);
      
      // Update duration once
      if (status.durationMillis) {
        setDuration(status.durationMillis);
      }
      
      // Update playing state
      setIsPlaying(status.isPlaying);

      // Auto-play next when finished
      if (status.didJustFinish) {
        console.log('🎵 Song finished!');
        handleSongFinishInternal();
      }
    }
  }, []);

  // Internal handler using refs (accesses latest values)
  const handleSongFinishInternal = () => {
    const currentMode = repeatModeRef.current;
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;

    console.log('Current mode:', currentMode);
    console.log('Playlist length:', currentPlaylist.length);
    console.log('Current index:', currentIdx);

    if (currentMode === REPEAT_MODES.REPEAT_ONE) {
      console.log('🔂 Repeat One - Replaying same song');
      if (soundRef.current) {
        soundRef.current.setPositionAsync(0);
        soundRef.current.playAsync();
      }
    } else if (currentMode === REPEAT_MODES.SHUFFLE) {
      console.log('🔀 Shuffle - Playing random song');
      playRandomSongInternal();
    } else {
      console.log('📋 Order - Playing next song');
      playNextSongInternal(true);
    }
  };

  // Internal next song function
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

  // Internal random song function
  const playRandomSongInternal = () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;

    if (currentPlaylist.length === 0) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * currentPlaylist.length);
    } while (randomIndex === currentIdx && currentPlaylist.length > 1);

    setCurrentIndex(randomIndex);
    currentIndexRef.current = randomIndex;
    playSongInternal(currentPlaylist[randomIndex]);
  };

  // Internal play song function
  const playSongInternal = async (song) => {
    try {
      setIsLoading(true);
      setCurrentSong(song);

      // Unload previous sound
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (err) {
          console.log('Unload error:', err);
        }
        soundRef.current = null;
      }

      // Get stream URL
      const data = await getStreamUrl(song._id || song.id);

      if (!data || !data.streamUrl) {
        setIsLoading(false);
        return;
      }

      // Create new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.streamUrl },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 100,  // ⭐ Faster updates
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      setIsLoading(false);
    } catch (error) {
      console.error('Play error:', error);
      setIsLoading(false);
    }
  };

  // Public play song function
  const playSong = useCallback(async (song, songList = null) => {
    // Update playlist if provided
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

  // Public next song
  const playNextSong = useCallback(() => {
    playNextSongInternal(true);
  }, []);

  // Public previous song
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

  // Public random song
  const playRandomSong = useCallback(() => {
    playRandomSongInternal();
  }, []);

  // ⭐ FIXED Play/Pause
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
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (err) {
        console.log('Stop error:', err);
      }
      soundRef.current = null;
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  // ⭐ FIXED Seek
  const seekTo = useCallback(async (millis) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(millis);
        // ⭐ Update position IMMEDIATELY (no wait!)
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
    
    console.log('🔄 Changed repeat mode:', repeatMode, '→', newMode);
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