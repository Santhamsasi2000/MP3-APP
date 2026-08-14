import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getRecentSongs } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useMiniPlayerPadding } from '../hooks/useMiniPlayerPadding';

export default function RecentlyAddedScreen({ navigation }) {
  const { isDark } = useTheme();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const bottomPadding = useMiniPlayerPadding(); 

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await getRecentSongs();
      setSongs(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSongs();
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={['top']}
        className="flex-1 bg-white dark:bg-dark justify-center items-center"
      >
        <ActivityIndicator size="large" color="#e94560" />
        <Text className="text-gray-800 dark:text-white mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-white dark:bg-dark"
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#e94560" />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-gray-900 dark:text-white text-2xl font-bold">
            Recently Added
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {songs.length} songs
          </Text>
        </View>
        <Ionicons name="time" size={30} color="#e94560" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
      >
        {songs.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="musical-notes" size={80} color={isDark ? '#666' : '#ccc'} />
            <Text className="text-gray-500 dark:text-gray-400 mt-4">
              No songs yet
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {songs.map((song, index) => (
              <TouchableOpacity
                key={song._id}
                onPress={() => navigation.navigate('Player', { song, songList: songs  })}
                className="flex-row items-center py-3"
              >
                <View className="w-12 h-12 rounded-xl bg-primary/20 justify-center items-center">
                  <Text className="text-primary font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text
                    className="text-gray-900 dark:text-white font-semibold"
                    numberOfLines={1}
                  >
                    {song.title}
                  </Text>
                  <Text
                    className="text-gray-500 dark:text-gray-400 text-xs mt-1"
                    numberOfLines={1}
                  >
                    {song.artist} • {song.movieName || 'Unknown'}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={28} color="#e94560" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}