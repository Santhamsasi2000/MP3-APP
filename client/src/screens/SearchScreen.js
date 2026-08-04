import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { songs, categories } from '../data/dummyData';

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="px-5 pt-5">
        <Text className="text-white text-3xl font-bold">Search</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-card mx-5 mt-5 px-4 rounded-xl h-12">
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          className="flex-1 text-white ml-3 text-base"
          placeholder="Songs, artists, albums..."
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {search.length === 0 ? (
          <View className="mt-6 px-5">
            <Text className="text-white text-xl font-bold mb-4">
              Browse Categories
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={{ backgroundColor: cat.color, width: '48%' }}
                  className="h-24 rounded-xl p-4 mb-3 overflow-hidden"
                >
                  <Text className="text-white text-lg font-bold">
                    {cat.name}
                  </Text>
                  <View className="absolute right-0 bottom-0">
                    <Ionicons
                      name={cat.icon}
                      size={45}
                      color="rgba(255,255,255,0.3)"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View className="mt-6 px-5">
            <Text className="text-white text-xl font-bold mb-4">
              Results ({filtered.length})
            </Text>
            {filtered.map((song) => (
              <TouchableOpacity
                key={song.id}
                onPress={() => navigation.navigate('Player', { song })}
                className="flex-row items-center py-3"
              >
                <Image
                  source={{ uri: song.cover }}
                  className="w-14 h-14 rounded-xl"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-white text-base font-semibold">
                    {song.title}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    {song.artist}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={32} color="#e94560" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}