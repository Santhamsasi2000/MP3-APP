import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';

export const MINI_PLAYER_HEIGHT = 70;

export default function MiniPlayer() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const {
    currentSong,
    isPlaying,
    isLoading,
    togglePlayPause,
    stopSong,
    position,
    duration,
  } = usePlayer();

  if (!currentSong) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View 
      className="absolute left-0 right-0"
      style={{ bottom: insets.bottom }}
    >
      {/* Progress Bar */}
      <View className="h-1 bg-gray-200 dark:bg-white/10">
        <View
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Mini Player Bar */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Player', { song: currentSong })}
      >
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#0f0f1e'] : ['#ffffff', '#f5f5f7']}
          className="flex-row items-center px-3 py-2.5 border-t border-primary/30"
          style={{ minHeight: MINI_PLAYER_HEIGHT }}
        >
          {/* Song Icon */}
          <View className="w-12 h-12 rounded-lg bg-primary/20 justify-center items-center">
            <Ionicons
              name={currentSong.category === 'bgm' ? 'musical-note' : 'musical-notes'}
              size={22}
              color="#e94560"
            />
          </View>

          {/* Song Info */}
          <View className="flex-1 ml-3">
            <Text
              className="text-gray-900 dark:text-white font-semibold text-sm"
              numberOfLines={1}
            >
              {currentSong.title}
            </Text>
            <Text
              className="text-gray-500 dark:text-gray-400 text-xs mt-1"
              numberOfLines={1}
            >
              {currentSong.artist}
              {isPlaying && ' • 🎵'}
              {!isPlaying && !isLoading && ' • ⏸️'}
              {isLoading && ' • ⏳'}
            </Text>
          </View>

          {/* Controls */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-primary justify-center items-center shadow-md"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={20}
                  color="#fff"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                stopSong();
              }}
              className="w-8 h-8 justify-center items-center"
            >
              <Ionicons 
                name="close" 
                size={20} 
                color={isDark ? '#888' : '#666'} 
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}