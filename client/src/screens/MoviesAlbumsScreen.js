import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
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
  const [sortOrder, setSortOrder] = useState('az');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    let result = [...movies];

    // Filter by search
    if (search) {
      result = result.filter((m) =>
        m._id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'az') {
        return a._id.localeCompare(b._id);
      } else if (sortOrder === 'za') {
        return b._id.localeCompare(a._id);
      } else {
        return b.count - a.count;
      }
  });

  setFilteredMovies(result);
}, [search, movies, sortOrder]);

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
        {/* ⭐ Filter Button */}
        <TouchableOpacity
          onPress={() => setShowSortMenu(true)}
          className="bg-primary/20 px-3 py-2 rounded-full flex-row items-center"
        >
          <Ionicons name="funnel" size={18} color="#e94560" />
          <Text className="text-primary text-xs font-semibold ml-1">
            {sortOrder === 'az' ? 'A-Z' : sortOrder === 'za' ? 'Z-A' : 'Count'}
          </Text>
        </TouchableOpacity>
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

      {/* Sort Modal */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center items-center"
          onPress={() => setShowSortMenu(false)}
          activeOpacity={1}
        >
          <View className="bg-white dark:bg-card rounded-2xl p-6 w-72">
            <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">
              Sort By
            </Text>

            <TouchableOpacity
              onPress={() => { setSortOrder('az'); setShowSortMenu(false); }}
              className={`p-4 rounded-xl mb-2 flex-row items-center ${
                sortOrder === 'az' ? 'bg-primary' : 'bg-gray-100 dark:bg-dark'
              }`}
            >
              <Ionicons 
                name="arrow-down" 
                size={20} 
                color={sortOrder === 'az' ? '#fff' : '#e94560'} 
              />
              <Text className={`ml-3 font-semibold ${
                sortOrder === 'az' ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                A to Z
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSortOrder('za'); setShowSortMenu(false); }}
              className={`p-4 rounded-xl mb-2 flex-row items-center ${
                sortOrder === 'za' ? 'bg-primary' : 'bg-gray-100 dark:bg-dark'
              }`}
            >
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color={sortOrder === 'za' ? '#fff' : '#e94560'} 
              />
              <Text className={`ml-3 font-semibold ${
                sortOrder === 'za' ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                Z to A
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSortOrder('count'); setShowSortMenu(false); }}
              className={`p-4 rounded-xl flex-row items-center ${
                sortOrder === 'count' ? 'bg-primary' : 'bg-gray-100 dark:bg-dark'
              }`}
            >
              <Ionicons 
                name="stats-chart" 
                size={20} 
                color={sortOrder === 'count' ? '#fff' : '#e94560'} 
              />
              <Text className={`ml-3 font-semibold ${
                sortOrder === 'count' ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                Most Songs First
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}