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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSongs } from '../services/api';

export default function AllSongsScreen({ navigation }) {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  
  // Sort & Filter states
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, mostPlayed
  const [filterCategory, setFilterCategory] = useState('all'); // all, song, bgm

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

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter((s) => s.category === filterCategory);
    }

    // Filter by search
    if (search) {
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(search.toLowerCase()) ||
          s.artist?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
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
            All Songs
          </Text>
          <Text className="text-gray-400 text-sm">
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

      {/* Search */}
      <View className="flex-row items-center bg-card mx-5 mt-3 px-4 rounded-xl h-12">
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          className="flex-1 text-white ml-3 text-base"
          placeholder="Search songs..."
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

      {/* Active Filters */}
      <View className="flex-row px-5 mt-3" style={{ gap: 8 }}>
        <View className="bg-primary/20 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs">{getSortLabel()}</Text>
        </View>
        <View className="bg-primary/20 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs">{getFilterLabel()}</Text>
        </View>
      </View>

      {/* Songs List */}
      <ScrollView
        className="flex-1 mt-3"
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
            <Ionicons name="musical-notes" size={80} color="#666" />
            <Text className="text-gray-400 mt-4">No songs found</Text>
          </View>
        ) : (
          <View className="px-5">
            {filteredSongs.map((song, index) => (
              <TouchableOpacity
                key={song._id}
                onPress={() => navigation.navigate('Player', { song })}
                className="flex-row items-center py-3"
              >
                <Text className="text-gray-400 w-8">{index + 1}</Text>
                <View className="w-12 h-12 rounded-lg bg-primary/20 justify-center items-center">
                  <Ionicons
                    name={
                      song.category === 'bgm' ? 'musical-note' : 'musical-notes'
                    }
                    size={20}
                    color="#e94560"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-white font-semibold" numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
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
                    <Text className="text-gray-500 text-xs mt-1">
                      🔥 {song.playCount}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-8" />
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
        >
          <View className="bg-dark rounded-t-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-600 rounded-full" />
            </View>

            <Text className="text-white text-xl font-bold mb-4">
              Sort & Filter
            </Text>

            {/* Sort Options */}
            <Text className="text-gray-400 mb-2 mt-4">Sort By</Text>
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
                  sortBy === option.key ? 'bg-primary' : 'bg-card'
                }`}
              >
                <Text className="text-white">{option.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Filter Options */}
            <Text className="text-gray-400 mb-2 mt-4">Category</Text>
            {[
              { key: 'all', label: '🎵 All Songs' },
              { key: 'song', label: '🎤 Songs Only' },
              { key: 'bgm', label: '🎼 BGM Only' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setFilterCategory(option.key)}
                className={`p-3 rounded-xl mb-2 ${
                  filterCategory === option.key ? 'bg-primary' : 'bg-card'
                }`}
              >
                <Text className="text-white">{option.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Apply Button */}
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