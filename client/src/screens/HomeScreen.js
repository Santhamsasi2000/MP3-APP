import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getSongs, searchSongs } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSongs, setTotalSongs] = useState(0);

  const fetchData = async () => {
    try {
      const songs = await getSongs();
      setTotalSongs(songs.length);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSearch = async (text) => {
    setSearch(text);
    if (text.length > 0) {
      const results = await searchSongs(text);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const menuButtons = [
    {
      id: 1,
      title: 'Recently Added',
      subtitle: 'Latest uploads',
      icon: 'time',
      colors: ['#e94560', '#c81d5e'],
      screen: 'RecentlyAdded',
    },
    {
      id: 2,
      title: 'Music Directors',
      subtitle: 'By folder',
      icon: 'musical-notes',
      colors: ['#533483', '#3a1f5f'],
      screen: 'MusicDirectors',
    },
    {
      id: 3,
      title: 'Movies / Albums',
      subtitle: 'Browse albums',
      icon: 'disc',
      colors: ['#0f3460', '#082144'],
      screen: 'MoviesAlbums',
    },
    {
      id: 4,
      title: 'All Songs',
      subtitle: `${totalSongs} songs`,
      icon: 'list',
      colors: ['#f47b3e', '#c95f2c'],
      screen: 'AllSongs',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-dark justify-center items-center">
        <ActivityIndicator size="large" color="#e94560" />
        <Text className="text-gray-800 dark:text-white mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5 pb-3">
        <View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            Welcome
          </Text>
          <Text className="text-gray-900 dark:text-white text-2xl font-bold mt-1">
            🎵 My Music
          </Text>
        </View>

        <View className="flex-row items-center" style={{ gap: 15 }}>
          {/* Theme Toggle Button */}
          <TouchableOpacity
            onPress={toggleTheme}
            className="bg-primary/20 p-2 rounded-full"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={22}
              color="#e94560"
            />
          </TouchableOpacity>

          {/* Upload Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Upload')}
            className="bg-primary/20 p-2 rounded-full"
          >
            <Ionicons name="cloud-upload" size={22} color="#e94560" />
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity>
            <Ionicons name="person-circle" size={40} color="#e94560" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 dark:bg-card mx-5 mt-3 px-4 rounded-xl h-12">
        <Ionicons name="search" size={20} color={isDark ? '#888' : '#666'} />
        <TextInput
          className="flex-1 text-gray-900 dark:text-white ml-3 text-base"
          placeholder="Search songs, artists..."
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={isDark ? '#888' : '#666'} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Search Results */}
        {search.length > 0 ? (
          <View className="mt-6 px-5">
            <Text className="text-gray-900 dark:text-white text-lg font-bold mb-3">
              Search Results ({searchResults.length})
            </Text>
            {searchResults.length === 0 ? (
              <View className="items-center py-10">
                <Ionicons name="search" size={50} color={isDark ? '#666' : '#999'} />
                <Text className="text-gray-500 dark:text-gray-400 mt-3">
                  No songs found
                </Text>
              </View>
            ) : (
              searchResults.map((song) => (
                <TouchableOpacity
                  key={song._id}
                  onPress={() => navigation.navigate('Player', { song })}
                  className="flex-row items-center py-3"
                >
                  <View className="w-14 h-14 rounded-xl bg-primary/20 justify-center items-center">
                    <Ionicons name="musical-note" size={24} color="#e94560" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text
                      className="text-gray-900 dark:text-white font-semibold"
                      numberOfLines={1}
                    >
                      {song.title}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      {song.artist}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={30} color="#e94560" />
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <>
            {/* 4 Menu Buttons */}
            <View className="px-5 mt-6">
              <View className="flex-row flex-wrap justify-between">
                {menuButtons.map((button) => (
                  <TouchableOpacity
                    key={button.id}
                    onPress={() => navigation.navigate(button.screen)}
                    style={{ width: '48%' }}
                    className="mb-4"
                  >
                    <LinearGradient
                      colors={button.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 20,
                        padding: 20,
                        minHeight: 140,
                        justifyContent: 'space-between',
                      }}
                    >
                      <View className="bg-white/20 w-14 h-14 rounded-full justify-center items-center">
                        <Ionicons name={button.icon} size={28} color="#fff" />
                      </View>
                      <View>
                        <Text className="text-white text-lg font-bold">
                          {button.title}
                        </Text>
                        <Text className="text-white opacity-80 text-xs mt-1">
                          {button.subtitle}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stats Card */}
            <View className="px-5 mt-4">
              <View className="bg-gray-100 dark:bg-card p-4 rounded-2xl">
                <View className="flex-row items-center">
                  <Ionicons name="stats-chart" size={20} color="#e94560" />
                  <Text className="text-gray-900 dark:text-white font-semibold ml-2">
                    Your Library
                  </Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  🎵 {totalSongs} songs uploaded
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  ☁️ Stored on cloud
                </Text>
              </View>
            </View>

            {/* Upload More Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Upload')}
              className="mx-5 mt-4 mb-8"
            >
              <LinearGradient
                colors={['#e94560', '#533483']}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="cloud-upload" size={22} color="#fff" />
                <Text className="text-white font-bold ml-2">
                  Upload More Songs
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}