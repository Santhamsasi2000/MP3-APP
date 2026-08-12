import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSongsByDirector } from '../services/api';

export default function DirectorSongsScreen({ route, navigation }) {
  const { director } = route.params;
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await getSongsByDirector(director);
      setSongs(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator size="large" color="#e94560" />
        <Text className="text-white mt-4">Loading songs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      {/* Gradient Header */}
      <LinearGradient
        colors={['#e94560', '#0f0f1e']}
        style={{ paddingBottom: 30 }}
      >
        <SafeAreaView>
          <View className="flex-row justify-between px-5 py-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="items-center px-5">
            <View className="w-32 h-32 rounded-full bg-white/20 justify-center items-center">
              <Ionicons name="person" size={60} color="#fff" />
            </View>
            <Text className="text-white text-2xl font-bold mt-4">
              {director}
            </Text>
            <Text className="text-white opacity-80 mt-1">
              {songs.length} songs
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Songs List */}
      <ScrollView className="flex-1 px-5 pt-5">
        {songs.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="musical-notes" size={80} color="#666" />
            <Text className="text-gray-400 mt-4">No songs found</Text>
          </View>
        ) : (
          songs.map((song, index) => (
            <TouchableOpacity
              key={song._id}
              onPress={() => navigation.navigate('Player', { song })}
              className="flex-row items-center py-3"
            >
              <Text className="text-gray-400 w-8">{index + 1}</Text>
              <View className="w-12 h-12 rounded-lg bg-primary/20 justify-center items-center">
                <Ionicons name="musical-note" size={20} color="#e94560" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-white font-semibold" numberOfLines={1}>
                  {song.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                  {song.movieName || 'Unknown'}
                </Text>
              </View>
              <Ionicons name="play-circle" size={28} color="#e94560" />
            </TouchableOpacity>
          ))
        )}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}