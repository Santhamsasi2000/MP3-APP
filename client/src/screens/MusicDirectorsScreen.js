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
import { LinearGradient } from 'expo-linear-gradient';
import { getDirectors } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useMiniPlayerPadding } from '../hooks/useMiniPlayerPadding';

export default function MusicDirectorsScreen({ navigation }) {
  const { isDark } = useTheme();
  const bottomPadding = useMiniPlayerPadding();
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('songs'); // 'songs' or 'bgm'

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      const data = await getDirectors();
      setDirectors(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDirectors();
  };

  // Filter directors based on active tab
  const filteredDirectors = directors.filter((director) => {
    const name = director._id.toLowerCase();
    if (activeTab === 'bgm') {
      // Show only BGM folders
      return name.includes('bgm');
    } else {
      // Show only Songs folders (not BGM)
      return !name.includes('bgm');
    }
  });

  const colors = [
    ['#e94560', '#c81d5e'],
    ['#533483', '#3a1f5f'],
    ['#0f3460', '#082144'],
    ['#f47b3e', '#c95f2c'],
    ['#16213e', '#0d1425'],
    ['#4a148c', '#311b92'],
    ['#00695c', '#004d40'],
    ['#bf360c', '#870000'],
  ];

  if (loading) {
    return (
      <SafeAreaView
        edges={['top']}
        className="flex-1 bg-white dark:bg-dark justify-center items-center"  style={{ paddingTop: 10 }}
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
            Music Directors
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredDirectors.length} directors
          </Text>
        </View>
        <Ionicons name="musical-notes" size={30} color="#e94560" />
      </View>

      {/* Tabs */}
      <View className="flex-row px-5 mt-2 mb-3" style={{ gap: 10 }}>
        {/* Songs Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab('songs')}
          className="flex-1"
        >
          {activeTab === 'songs' ? (
            <LinearGradient
              colors={['#e94560', '#533483']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-xl p-3 flex-row justify-center items-center"
            >
              <Ionicons name="musical-notes" size={20} color="#fff" />
              <Text className="text-white font-bold ml-2 text-base">
                Songs
              </Text>
            </LinearGradient>
          ) : (
            <View className="bg-gray-100 dark:bg-card rounded-xl p-3 flex-row justify-center items-center">
              <Ionicons 
                name="musical-notes-outline" 
                size={20} 
                color={isDark ? '#888' : '#666'} 
              />
              <Text className="text-gray-500 dark:text-gray-400 font-semibold ml-2 text-base">
                Songs
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* BGM Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab('bgm')}
          className="flex-1"
        >
          {activeTab === 'bgm' ? (
            <LinearGradient
              colors={['#e94560', '#533483']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-xl p-3 flex-row justify-center items-center"
            >
              <Ionicons name="musical-note" size={20} color="#fff" />
              <Text className="text-white font-bold ml-2 text-base">
                BGM
              </Text>
            </LinearGradient>
          ) : (
            <View className="bg-gray-100 dark:bg-card rounded-xl p-3 flex-row justify-center items-center">
              <Ionicons 
                name="musical-note-outline" 
                size={20} 
                color={isDark ? '#888' : '#666'} 
              />
              <Text className="text-gray-500 dark:text-gray-400 font-semibold ml-2 text-base">
                BGM
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Info */}
      <View className="px-5 mb-2">
        <Text className="text-gray-500 dark:text-gray-400 text-xs">
          {activeTab === 'songs' 
            ? '🎵 Showing folders with songs' 
            : '🎼 Showing folders with BGM'}
        </Text>
      </View>

      {/* Directors List */}
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
        {filteredDirectors.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons 
              name={activeTab === 'songs' ? 'musical-notes' : 'musical-note'} 
              size={80} 
              color={isDark ? '#666' : '#ccc'} 
            />
            <Text className="text-gray-500 dark:text-gray-400 mt-4">
              No {activeTab === 'songs' ? 'Songs' : 'BGM'} folders found
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {filteredDirectors.map((director, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate('DirectorSongs', {
                    director: director._id,
                  })
                }
                className="mb-3"
              >
                <LinearGradient
                  colors={colors[index % colors.length]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-4 flex-row items-center"
                >
                  {/* Icon */}
                  <View className="w-14 h-14 rounded-full bg-white/20 justify-center items-center">
                    <Ionicons 
                      name={activeTab === 'songs' ? 'person' : 'musical-note'} 
                      size={28} 
                      color="#fff" 
                    />
                  </View>

                  {/* Info */}
                  <View className="flex-1 ml-4">
                    <Text 
                      className="text-white text-base font-bold"
                      numberOfLines={1}
                    >
                      {director._id}
                    </Text>
                    <Text className="text-white opacity-80 text-xs mt-1">
                      {director.count} {activeTab === 'songs' ? 'songs' : 'BGM tracks'}
                    </Text>
                  </View>

                  {/* Arrow */}
                  <Ionicons name="chevron-forward" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}