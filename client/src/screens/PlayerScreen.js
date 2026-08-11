import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ route, navigation }) {
  const { song } = route.params;
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    playSong,
    togglePlayPause,
    seekTo,
  } = usePlayer();

  // Play song if different from current
  useEffect(() => {
    if (!currentSong || currentSong._id !== song._id) {
      playSong(song);
    }
  }, [song]);

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const skipForward = () => {
    const newPos = Math.min(position + 10000, duration);
    seekTo(newPos);
  };

  const skipBackward = () => {
    const newPos = Math.max(position - 10000, 0);
    seekTo(newPos);
  };

  return (
    <LinearGradient
      colors={['#e94560', '#0f0f1e', '#0f0f1e']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 p-5">
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="flex-row justify-between items-center py-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={30} color="#fff" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white text-xs opacity-70">
              NOW PLAYING
            </Text>
            <Text
              className="text-white text-sm font-bold mt-1"
              numberOfLines={1}
            >
              {song.movieName || song.album || 'Unknown'}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View className="items-center mt-8">
          <View
            style={{
              width: width - 100,
              height: width - 100,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              justifyContent: 'center',
              alignItems: 'center',
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
        <View className="mt-8 px-2 items-center">
          <Text
            className="text-white text-2xl font-bold text-center"
            numberOfLines={2}
          >
            {song.title}
          </Text>
          <Text className="text-white opacity-70 text-base mt-2 text-center">
            {song.artist}
          </Text>
          {song.musicDirector && (
            <Text className="text-white opacity-50 text-sm mt-1">
              🎼 {song.musicDirector}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View className="mt-8 px-2">
          <View className="h-1 bg-white/20 rounded-full">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-white opacity-70 text-xs">
              {formatTime(position)}
            </Text>
            <Text className="text-white opacity-70 text-xs">
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row justify-around items-center mt-8 px-2">
          <TouchableOpacity>
            <Ionicons name="shuffle" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipBackward}>
            <View className="items-center">
              <Ionicons name="play-back" size={35} color="#fff" />
              <Text className="text-white text-xs opacity-70">-10s</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            disabled={isLoading}
            className="w-20 h-20 rounded-full bg-white justify-center items-center"
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

          <TouchableOpacity onPress={skipForward}>
            <View className="items-center">
              <Ionicons name="play-forward" size={35} color="#fff" />
              <Text className="text-white text-xs opacity-70">+10s</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="repeat" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View className="flex-row justify-around mt-10 pb-5">
          <TouchableOpacity className="p-2">
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="download-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="heart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View className="items-center mt-2">
          <Text className="text-white opacity-50 text-xs">
            {isLoading && '⏳ Loading...'}
            {isPlaying && !isLoading && '🎵 Streaming'}
            {!isPlaying && !isLoading && '⏸️ Paused'}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}