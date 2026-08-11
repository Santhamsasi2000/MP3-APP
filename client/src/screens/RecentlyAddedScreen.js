import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecentSongs } from '../services/api';

export default function RecentlyAddedScreen({ navigation }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      <SafeAreaView className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator size="large" color="#e94560" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-white text-2xl font-bold">
            Recently Added
          </Text>
          <Text className="text-gray-400 text-sm">
            {songs.length} songs
          </Text>
        </View>
        <Ionicons name="time" size={30} color="#e94560" />
      </View>

      <ScrollView
        className="flex-1"
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
            <Ionicons name="musical-notes" size={80} color="#666" />
            <Text className="text-gray-400 mt-4">No songs yet</Text>
          </View>
        ) : (
          <View className="px-5">
            {songs.map((song, index) => (
              <TouchableOpacity
                key={song._id}
                onPress={() => navigation.navigate('Player', { song })}
                className="flex-row items-center py-3"
              >
                <View className="w-12 h-12 rounded-xl bg-primary/20 justify-center items-center">
                  <Text className="text-primary font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-white font-semibold" numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                    {song.artist} • {song.movieName || 'Unknown'}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={28} color="#e94560" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}