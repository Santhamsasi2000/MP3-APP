import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMovies } from '../services/api';

export default function MoviesAlbumsScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredMovies(
        movies.filter((m) =>
          m._id.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredMovies(movies);
    }
  }, [search, movies]);

  const fetchMovies = async () => {
    try {
      const data = await getMovies();
      setMovies(data);
      setFilteredMovies(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
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
            Movies / Albums
          </Text>
          <Text className="text-gray-400 text-sm">
            {filteredMovies.length} albums
          </Text>
        </View>
        <Ionicons name="disc" size={30} color="#e94560" />
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-card mx-5 mt-3 px-4 rounded-xl h-12">
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          className="flex-1 text-white ml-3 text-base"
          placeholder="Search movies..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
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
        {filteredMovies.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="disc" size={80} color="#666" />
            <Text className="text-gray-400 mt-4">No movies found</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between px-5 mt-4">
            {filteredMovies.map((movie, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate('MovieSongs', {
                    movie: movie._id,
                  })
                }
                style={{ width: '48%' }}
                className="mb-4"
              >
                <View className="bg-card rounded-2xl p-4">
                  <View className="bg-primary/20 w-full aspect-square rounded-xl justify-center items-center">
                    <Ionicons name="film" size={50} color="#e94560" />
                  </View>
                  <Text
                    className="text-white font-bold mt-3"
                    numberOfLines={1}
                  >
                    {movie._id}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs mt-1"
                    numberOfLines={1}
                  >
                    🎼 {movie.director}
                  </Text>
                  <Text className="text-primary text-xs mt-1">
                    {movie.count} songs
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}