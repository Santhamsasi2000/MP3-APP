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
import { LinearGradient } from 'expo-linear-gradient';
import { getDirectors } from '../services/api';

export default function MusicDirectorsScreen({ navigation }) {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const colors = [
    ['#e94560', '#c81d5e'],
    ['#533483', '#3a1f5f'],
    ['#0f3460', '#082144'],
    ['#f47b3e', '#c95f2c'],
    ['#16213e', '#0d1425'],
  ];

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
            Music Directors
          </Text>
          <Text className="text-gray-400 text-sm">
            {directors.length} directors
          </Text>
        </View>
        <Ionicons name="musical-notes" size={30} color="#e94560" />
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
        <View className="px-5 mt-4">
          {directors.map((director, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                navigation.navigate('DirectorSongs', {
                  director: director._id,
                })
              }
              className="mb-4"
            >
              <LinearGradient
                colors={colors[index % colors.length]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View className="w-16 h-16 rounded-full bg-white/20 justify-center items-center">
                  <Ionicons name="person" size={32} color="#fff" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-white text-lg font-bold">
                    {director._id}
                  </Text>
                  <Text className="text-white opacity-80 text-sm mt-1">
                    {director.count} songs
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}