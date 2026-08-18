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
  
  // ⭐ REFS FOR LATEST VALUES (Critical for callbacks!)
  const soundRef = useRef(null);
  const repeatModeRef = useRef(repeatMode);
  const playlistRef = useRef(playlist);
  const currentIndexRef = useRef(currentIndex);
  const isChangingSongRef = useRef(false);

  // Keep refs updated
  useEffect(() => {
    repeatModeRef.current = repeatMode;
    console.log('🔄 Repeat mode changed to:', repeatMode);
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
          shouldDuckAndroid: false,  // ⭐ Changed
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
          interruptionModeIOS: 1,  // DO_NOT_MIX
          interruptionModeAndroid: 1,  // DO_NOT_MIX
        });
        console.log('✅ Audio mode configured');
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
  if (!status.isLoaded) return;

  const newPosition = status.positionMillis || 0;
  const newDuration = status.durationMillis || 0;
  const newIsPlaying = status.isPlaying || false;

  // Only update if changed significantly
  setPosition(prev => 
    Math.abs(prev - newPosition) > 100 ? newPosition : prev
  );
  
  setDuration(prev => 
    prev !== newDuration && newDuration > 0 ? newDuration : prev
  );
  
  setIsPlaying(prev => 
    prev !== newIsPlaying ? newIsPlaying : prev
  );

  if (status.didJustFinish && !isChangingSongRef.current) {
    handleSongFinishInternal();
  }
  }, []); // ⭐ Empty deps - CRITICAL!

  // ⭐ CRITICAL: Handle song finish based on REPEAT MODE
  const handleSongFinishInternal = async () => {
    const currentMode = repeatModeRef.current;
    
    console.log('🎵 Song finished, mode:', currentMode);

    try {
      // Unload current sound first
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Small delay to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 100));

      // Play next based on mode
      if (currentMode === REPEAT_MODES.REPEAT_ONE) {
        const currentPlaylist = playlistRef.current;
        const currentIdx = currentIndexRef.current;
        if (currentPlaylist[currentIdx]) {
          await playSongInternal(currentPlaylist[currentIdx]);
        }
      } else if (currentMode === REPEAT_MODES.SHUFFLE) {
        await playRandomSongInternal();
      } else {
        await playNextSongInternal(true);
      }
    } catch (error) {
      console.error('Auto-play error:', error);
    }
  };

  // Stop current sound completely
  const stopCurrentSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (err) {
        console.log('Stop error:', err);
      }
      soundRef.current = null;
    }
  };

  // Internal play function
  const playSongInternal = async (song) => {
    try {
      if (isChangingSongRef.current) {
        console.log('⚠️ Already changing song');
        return;
      }
      
      isChangingSongRef.current = true;
      
      setIsLoading(true);
      setCurrentSong(song);
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);

      await stopCurrentSound();

      const data = await getStreamUrl(song._id || song.id);

      if (!data || !data.streamUrl) {
        setIsLoading(false);
        isChangingSongRef.current = false;
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.streamUrl },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 100,
          androidImplementation: 'MediaPlayer',
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      // ⭐ FORCE play after loading (important for background)
      try {
        await newSound.playAsync();
        setIsPlaying(true);
      } catch (playError) {
        console.log('Play error:', playError);
      }
      setIsLoading(false);
      isChangingSongRef.current = false;
      
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

  // Play next song internal
  const playNextSongInternal = (loop = true) => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;

    if (currentPlaylist.length === 0) {
      console.log('❌ No playlist!');
      return;
    }

    let nextIndex = currentIdx + 1;
    
    if (nextIndex >= currentPlaylist.length) {
      if (loop) {
        nextIndex = 0;
      } else {
        return;
      }
    }

    console.log(`📋 Next: ${currentIdx} → ${nextIndex}`);
    
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    playSongInternal(currentPlaylist[nextIndex]);
  };

  // Public next song - respects repeat mode
  const playNextSong = useCallback(() => {
  const mode = repeatModeRef.current;
  console.log('▶️ Manual Next - Mode:', mode);

  if (mode === REPEAT_MODES.REPEAT_ONE) {
    // Repeat One: Play same song again
    console.log('🔂 Manual Next → Repeat same song');
    if (soundRef.current) {
      soundRef.current.setPositionAsync(0);
      soundRef.current.playAsync();
    }
  } else if (mode === REPEAT_MODES.SHUFFLE) {
    // Shuffle: Play random song
    console.log('🔀 Manual Next → Random song');
    playRandomSongInternal();
  } else {
    // Order: Play next in sequence
    console.log('📋 Manual Next → Next in order');
    playNextSongInternal(true);
  }
  }, []);

  // Public previous song - respects repeat mode
  const playPreviousSong = useCallback(() => {
    const mode = repeatModeRef.current;
    console.log('⏮ Manual Previous - Mode:', mode);

    if (mode === REPEAT_MODES.REPEAT_ONE) {
      // Repeat One: Play same song again
      if (soundRef.current) {
        soundRef.current.setPositionAsync(0);
        soundRef.current.playAsync();
      }
    } else if (mode === REPEAT_MODES.SHUFFLE) {
      // Shuffle: Play random song
      playRandomSongInternal();
    } else {
      // Order: Play previous in sequence
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
    }
  }, []);

  // ⭐ FIXED: Play random song properly
  const playRandomSongInternal = () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;

    console.log('🎲 Random from playlist of', currentPlaylist.length);

    if (currentPlaylist.length === 0) return;
    
    if (currentPlaylist.length === 1) {
      // Only one song, replay it
      console.log('Only 1 song, replaying');
      playSongInternal(currentPlaylist[0]);
      return;
    }
    
    // Get random index different from current
    let randomIndex;
    let attempts = 0;
    do {
      randomIndex = Math.floor(Math.random() * currentPlaylist.length);
      attempts++;
      if (attempts > 20) break;
    } while (randomIndex === currentIdx);

    console.log(`🔀 Random: ${currentIdx} → ${randomIndex} (of ${currentPlaylist.length})`);
    
    setCurrentIndex(randomIndex);
    currentIndexRef.current = randomIndex;
    playSongInternal(currentPlaylist[randomIndex]);
  };

  const playRandomSong = useCallback(() => {
    playRandomSongInternal();
  }, []);

  // ⭐ FIXED: Play/Pause with status check
  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.isPlaying) {
          console.log('⏸️ Pausing');
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          console.log('▶️ Playing');
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

  // ⭐ CRITICAL: Cycle repeat mode properly
  const cycleRepeatMode = useCallback(() => {
    const modes = [
      REPEAT_MODES.ORDER,
      REPEAT_MODES.REPEAT_ONE,
      REPEAT_MODES.SHUFFLE,
    ];
    
    const currentIdx = modes.indexOf(repeatMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    const newMode = modes[nextIdx];
    
    console.log('🔄 CYCLE MODE:', repeatMode, '→', newMode);
    
    // Update both state AND ref immediately
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