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
import { getSongs } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useMiniPlayerPadding } from '../hooks/useMiniPlayerPadding';

export default function AllSongsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const bottomPadding = useMiniPlayerPadding(); 

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [songs, search, sortBy, filterCategory]);

  const fetchSongs = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...songs];

    if (filterCategory !== 'all') {
      result = result.filter((s) => s.category === filterCategory);
    }

    if (search) {
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(search.toLowerCase()) ||
          s.artist?.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        result.sort((a, b) => a.title?.localeCompare(b.title));
        break;
      case 'mostPlayed':
        result.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        break;
    }

    setFilteredSongs(result);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSongs();
  };

  const getSortLabel = () => {
    const labels = {
      newest: '🆕 Newest',
      oldest: '📅 Oldest',
      name: '🔤 Name (A-Z)',
      mostPlayed: '🔥 Most Played',
    };
    return labels[sortBy];
  };

  const getFilterLabel = () => {
    const labels = {
      all: '🎵 All',
      song: '🎤 Songs',
      bgm: '🎼 BGM',
    };
    return labels[filterCategory];
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
      className="flex-1 bg-white dark:bg-dark"
    >
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#e94560" />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-gray-900 dark:text-white text-2xl font-bold">
            All Songs
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredSongs.length} of {songs.length} songs
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowFilter(true)}
          className="bg-primary/20 p-2 rounded-full"
        >
          <Ionicons name="filter" size={22} color="#e94560" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center bg-gray-100 dark:bg-card mx-5 mt-2 px-4 rounded-xl h-12">
        <Ionicons name="search" size={20} color={isDark ? '#888' : '#666'} />
        <TextInput
          className="flex-1 text-gray-900 dark:text-white ml-3 text-base"
          placeholder="Search songs..."
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

      {/* Filter Tags */}
      <View className="flex-row px-5 mt-3" style={{ gap: 8 }}>
        <View className="bg-primary/20 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs">{getSortLabel()}</Text>
        </View>
        <View className="bg-primary/20 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs">{getFilterLabel()}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 mt-3"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
      >
        {filteredSongs.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="musical-notes" size={80} color={isDark ? '#666' : '#ccc'} />
            <Text className="text-gray-500 dark:text-gray-400 mt-4">
              No songs found
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {filteredSongs.map((song, index) => (
              <TouchableOpacity
                key={song._id}
                onPress={() => navigation.navigate('Player', {
                   song,
                   songList: filteredSongs
                  })}
                className="flex-row items-center py-3"
              >
                <Text className="text-gray-500 dark:text-gray-400 w-8">
                  {index + 1}
                </Text>
                <View className="w-12 h-12 rounded-lg bg-primary/20 justify-center items-center">
                  <Ionicons
                    name={song.category === 'bgm' ? 'musical-note' : 'musical-notes'}
                    size={20}
                    color="#e94560"
                  />
                </View>
                <View className="flex-1 ml-3">
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
                <View className="items-end">
                  {song.category === 'bgm' && (
                    <View className="bg-primary/20 px-2 py-1 rounded">
                      <Text className="text-primary text-xs">BGM</Text>
                    </View>
                  )}
                  {song.playCount > 0 && (
                    <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      🔥 {song.playCount}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setShowFilter(false)}
          activeOpacity={1}
        >
          <View className="bg-white dark:bg-dark rounded-t-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </View>

            <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">
              Sort & Filter
            </Text>

            <Text className="text-gray-500 dark:text-gray-400 mb-2 mt-4">
              Sort By
            </Text>
            {[
              { key: 'newest', label: '🆕 Newest First' },
              { key: 'oldest', label: '📅 Oldest First' },
              { key: 'name', label: '🔤 Name (A-Z)' },
              { key: 'mostPlayed', label: '🔥 Most Played' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSortBy(option.key)}
                className={`p-3 rounded-xl mb-2 ${
                  sortBy === option.key 
                    ? 'bg-primary' 
                    : 'bg-gray-100 dark:bg-card'
                }`}
              >
                <Text 
                  className={
                    sortBy === option.key 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-white'
                  }
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text className="text-gray-500 dark:text-gray-400 mb-2 mt-4">
              Category
            </Text>
            {[
              { key: 'all', label: '🎵 All Songs' },
              { key: 'song', label: '🎤 Songs Only' },
              { key: 'bgm', label: '🎼 BGM Only' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setFilterCategory(option.key)}
                className={`p-3 rounded-xl mb-2 ${
                  filterCategory === option.key 
                    ? 'bg-primary' 
                    : 'bg-gray-100 dark:bg-card'
                }`}
              >
                <Text 
                  className={
                    filterCategory === option.key 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-white'
                  }
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowFilter(false)}
              className="bg-primary p-4 rounded-xl mt-4"
            >
              <Text className="text-white text-center font-bold">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}