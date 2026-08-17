import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMovies } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useMiniPlayerPadding } from '../hooks/useMiniPlayerPadding';

export default function MoviesAlbumsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const bottomPadding = useMiniPlayerPadding();

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
      <SafeAreaView
        edges={['top']}
        className="flex-1 bg-white dark:bg-dark justify-center items-center"
      >
        <ActivityIndicator size="large" color="#e94560" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-white dark:bg-dark"  style={{ paddingTop: 10 }}
    >
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#e94560" />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-gray-900 dark:text-white text-2xl font-bold">
            Movies / Albums
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredMovies.length} albums
          </Text>
        </View>
        <Ionicons name="disc" size={30} color="#e94560" />
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 dark:bg-card mx-5 mt-2 px-4 rounded-xl h-12">
        <Ionicons name="search" size={20} color={isDark ? '#888' : '#666'} />
        <TextInput
          className="flex-1 text-gray-900 dark:text-white ml-3 text-base"
          placeholder="Search movies..."
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={isDark ? '#888' : '#666'} />
          </TouchableOpacity>
        )}
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
        {filteredMovies.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="disc" size={80} color={isDark ? '#666' : '#ccc'} />
            <Text className="text-gray-500 dark:text-gray-400 mt-4">
              No movies found
            </Text>
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
                <View className="bg-gray-100 dark:bg-card rounded-2xl p-4">
                  <View className="bg-primary/20 w-full aspect-square rounded-xl justify-center items-center">
                    <Ionicons name="film" size={50} color="#e94560" />
                  </View>
                  <Text
                    className="text-gray-900 dark:text-white font-bold mt-3"
                    numberOfLines={1}
                  >
                    {movie._id}
                  </Text>
                  <Text
                    className="text-gray-500 dark:text-gray-400 text-xs mt-1"
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
      </ScrollView>
    </SafeAreaView>
  );
}