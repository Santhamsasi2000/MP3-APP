import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { usePlayer, REPEAT_MODES } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { deleteSong } from '../services/api';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ route, navigation }) {
  const { song: initialSong, songList } = route.params;
  const { isDark } = useTheme();
  
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    repeatMode,
    playSong,
    playNextSong,
    playPreviousSong,
    togglePlayPause,
    seekTo,
    cycleRepeatMode,
  } = usePlayer();

  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isChanging, setIsChanging] = useState(false); // ⭐ Prevent rapid clicks

  const displaySong = currentSong || initialSong;

  useEffect(() => {
    if (!currentSong || currentSong._id !== initialSong._id) {
      playSong(initialSong, songList || []);
    }
  }, []);

  useEffect(() => {
    if (!isSeeking) {
      setSliderValue(position);
    }
  }, [position, isSeeking]);

  const formatTime = useCallback((millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleSliderChange = useCallback((value) => {
    setSliderValue(value);
  }, []);

  const handleSliderStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSliderComplete = useCallback(async (value) => {
    await seekTo(value);
    setSliderValue(value);
    setTimeout(() => setIsSeeking(false), 100);
  }, [seekTo]);

  // ⭐ Debounced Next/Previous
  const handleNext = useCallback(async () => {
    if (isChanging) return;
    setIsChanging(true);
    await playNextSong();
    setTimeout(() => setIsChanging(false), 800);
  }, [isChanging, playNextSong]);

  const handlePrevious = useCallback(async () => {
    if (isChanging) return;
    setIsChanging(true);
    await playPreviousSong();
    setTimeout(() => setIsChanging(false), 800);
  }, [isChanging, playPreviousSong]);

  const repeatIcon = useMemo(() => {
    switch (repeatMode) {
      case REPEAT_MODES.ORDER:
        return { name: 'list', label: 'Order' };
      case REPEAT_MODES.REPEAT_ONE:
        return { name: 'repeat', label: 'Repeat One' };
      case REPEAT_MODES.SHUFFLE:
        return { name: 'shuffle', label: 'Shuffle' };
      default:
        return { name: 'list', label: 'Order' };
    }
  }, [repeatMode]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Song',
      `Delete "${displaySong.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            navigation.goBack();
            try {
              await deleteSong(displaySong._id);
            } catch (error) {
              console.error('Delete failed:', error);
            }
          },
        },
      ]
    );
  }, [displaySong, navigation]);

  const handleAlbumOpen = useCallback(() => {
    if (displaySong.movieName) {
      navigation.navigate('MovieSongs', { movie: displaySong.movieName });
    }
  }, [displaySong, navigation]);

  const handleFolderOpen = useCallback(() => {
    if (displaySong.musicDirector) {
      navigation.navigate('DirectorSongs', { director: displaySong.musicDirector });
    }
  }, [displaySong, navigation]);

  const gradientColors = useMemo(() => 
    isDark 
      ? ['#e94560', '#0f0f1e', '#0f0f1e']
      : ['#e94560', '#ff6b8b', '#ffffff'],
    [isDark]
  );

  return (
    <LinearGradient colors={gradientColors} className="flex-1">
      <SafeAreaView edges={['top']} className="flex-1 px-5" style={{ paddingTop: 10 }}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="flex-row justify-between items-center py-2">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={30} color="#fff" />
          </TouchableOpacity>
          <View className="items-center flex-1 mx-4">
            <Text className="text-white text-xs opacity-70">NOW PLAYING</Text>
            <Text 
              className="text-white text-sm font-bold mt-1" 
              numberOfLines={1}
            >
              {displaySong.movieName || displaySong.album || 'Unknown'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View className="items-center mt-6">
          <View
            className="rounded-2xl bg-white/10 justify-center items-center"
            style={{
              width: width - 100,
              height: width - 100,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Ionicons name="musical-notes" size={120} color="#fff" />
            )}
          </View>
        </View>

        {/* Song Info */}
        <View className="mt-6 px-2 items-center">
          <Text
            className="text-white text-xl font-bold text-center"
            numberOfLines={2}
          >
            {displaySong.title}
          </Text>
          <Text className="text-white opacity-70 text-sm mt-2 text-center">
            {displaySong.artist}
          </Text>
          {displaySong.musicDirector && (
            <Text className="text-white opacity-50 text-xs mt-1">
              🎼 {displaySong.musicDirector}
            </Text>
          )}
        </View>

        {/* Slider */}
        <View className="mt-6 px-2">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration || 1}
            value={sliderValue}
            onValueChange={handleSliderChange}
            onSlidingStart={handleSliderStart}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#ffffff"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#ffffff"
            tapToSeek={true}
          />
          <View className="flex-row justify-between px-2 -mt-1">
            <Text className="text-white opacity-70 text-xs">
              {formatTime(sliderValue)}
            </Text>
            <Text className="text-white opacity-70 text-xs">
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Main Controls */}
        <View className="flex-row justify-around items-center mt-6 px-2">
          <TouchableOpacity 
            onPress={cycleRepeatMode}
            className="items-center"
            activeOpacity={0.7}
          >
            <Ionicons name={repeatIcon.name} size={26} color="#fff" />
            <Text className="text-white text-xs opacity-70 mt-1">
              {repeatIcon.label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handlePrevious}
            disabled={isChanging}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="play-skip-back" 
              size={35} 
              color="#fff" 
              style={{ opacity: isChanging ? 0.5 : 1 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            disabled={isLoading || isChanging}
            className="w-20 h-20 rounded-full bg-white justify-center items-center"
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#0f0f1e" size="large" />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#0f0f1e"
                style={{ marginLeft: isPlaying ? 0 : 4 }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleNext}
            disabled={isChanging}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={35} 
              color="#fff" 
              style={{ opacity: isChanging ? 0.5 : 1 }}
            />
          </TouchableOpacity>

          <View className="items-center">
            <Ionicons name="musical-notes" size={26} color="rgba(255,255,255,0.3)" />
            <Text className="text-white text-xs opacity-0 mt-1">Space</Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="flex-row justify-around mt-8 pb-5">
          <TouchableOpacity 
            onPress={handleAlbumOpen}
            className="items-center"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center">
              <Ionicons name="disc" size={24} color="#fff" />
            </View>
            <Text className="text-white text-xs opacity-70 mt-1">Album</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleFolderOpen}
            className="items-center"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center">
              <Ionicons name="folder" size={24} color="#fff" />
            </View>
            <Text className="text-white text-xs opacity-70 mt-1">Folder</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center">
              <Ionicons name="share-social" size={24} color="#fff" />
            </View>
            <Text className="text-white text-xs opacity-70 mt-1">Share</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center">
              <Ionicons name="heart-outline" size={24} color="#fff" />
            </View>
            <Text className="text-white text-xs opacity-70 mt-1">Like</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}