import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  recentlyAdded,
  musicDirectorsSongs,
  musicDirectorsBGM,
  albums,
  mostPlayed,
} from '../data/dummyData';

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-5 pb-3">
          <View>
            <Text className="text-gray-400 text-sm">Welcome</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              🎵 My Music
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="person-circle" size={40} color="#e94560" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-card mx-5 mt-3 px-4 rounded-xl h-12">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            className="flex-1 text-white ml-3 text-base"
            placeholder="Search songs, artists, albums..."
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

        {/* ===== SECTION 1: Recently Added ===== */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="time" size={22} color="#e94560" />
              <Text className="text-white text-xl font-bold ml-2">
                Recently Added
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {recentlyAdded.map((song) => (
              <TouchableOpacity
                key={song.id}
                onPress={() => navigation.navigate('Player', { song })}
                className="mr-4 w-40"
              >
                <View className="relative">
                  <Image
                    source={{ uri: song.cover }}
                    className="w-40 h-40 rounded-2xl"
                  />
                  <View className="absolute bottom-2 right-2 bg-primary/90 rounded-full p-2">
                    <Ionicons name="play" size={16} color="#fff" />
                  </View>
                </View>
                <Text
                  className="text-white text-sm font-semibold mt-2"
                  numberOfLines={1}
                >
                  {song.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                  {song.artist}
                </Text>
                <Text className="text-primary text-xs mt-1">
                  {song.addedDate}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ===== SECTION 2: Music Directors - Songs ===== */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="musical-notes" size={22} color="#e94560" />
              <Text className="text-white text-xl font-bold ml-2">
                Songs by Directors
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {musicDirectorsSongs.map((director) => (
              <TouchableOpacity
                key={director.id}
                onPress={() =>
                  navigation.navigate('Playlist', {
                    playlist: {
                      name: director.name,
                      songCount: director.songCount,
                      cover: director.cover,
                    },
                  })
                }
                className="mr-4 items-center"
              >
                <View className="relative">
                  <Image
                    source={{ uri: director.cover }}
                    className="w-32 h-32 rounded-full"
                    style={{ borderWidth: 3, borderColor: director.color }}
                  />
                  <View
                    style={{ backgroundColor: director.color }}
                    className="absolute bottom-0 right-0 rounded-full px-2 py-1"
                  >
                    <Text className="text-white text-xs font-bold">
                      {director.songCount}
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-white text-sm font-semibold mt-3 text-center"
                  style={{ maxWidth: 128 }}
                  numberOfLines={2}
                >
                  {director.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {director.songCount} songs
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ===== SECTION 3: Music Directors - BGM ===== */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="headset" size={22} color="#e94560" />
              <Text className="text-white text-xl font-bold ml-2">
                BGM by Directors
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {musicDirectorsBGM.map((director) => (
              <TouchableOpacity
                key={director.id}
                onPress={() =>
                  navigation.navigate('Playlist', {
                    playlist: {
                      name: `${director.name} - BGM`,
                      songCount: director.bgmCount,
                      cover: director.cover,
                    },
                  })
                }
                className="mr-4"
              >
                <View
                  style={{ backgroundColor: director.color }}
                  className="w-40 h-24 rounded-2xl p-3 justify-between overflow-hidden"
                >
                  <View className="flex-row justify-between items-start">
                    <Ionicons name="musical-note" size={24} color="#fff" />
                    <View className="bg-white/20 rounded-full px-2 py-1">
                      <Text className="text-white text-xs font-bold">
                        {director.bgmCount}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text
                      className="text-white text-base font-bold"
                      numberOfLines={1}
                    >
                      {director.name}
                    </Text>
                    <Text className="text-white/80 text-xs mt-1">
                      BGM Collection
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ===== SECTION 4: Albums (Movies) ===== */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="disc" size={22} color="#e94560" />
              <Text className="text-white text-xl font-bold ml-2">
                Movie Albums
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {albums.map((album) => (
              <TouchableOpacity
                key={album.id}
                onPress={() =>
                  navigation.navigate('Playlist', {
                    playlist: {
                      name: album.name,
                      songCount: album.songCount,
                      cover: album.cover,
                    },
                  })
                }
                className="mr-4 w-40"
              >
                <View className="relative">
                  <Image
                    source={{ uri: album.cover }}
                    className="w-40 h-40 rounded-2xl"
                  />
                  <View className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-1">
                    <Text className="text-white text-xs">{album.year}</Text>
                  </View>
                </View>
                <Text
                  className="text-white text-base font-bold mt-2"
                  numberOfLines={1}
                >
                  {album.name}
                </Text>
                <Text
                  className="text-gray-400 text-xs mt-1"
                  numberOfLines={1}
                >
                  🎼 {album.director}
                </Text>
                <Text className="text-primary text-xs mt-1">
                  {album.songCount} songs
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ===== SECTION 5: Most Played ===== */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="flame" size={22} color="#e94560" />
              <Text className="text-white text-xl font-bold ml-2">
                Most Played
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="px-5">
            {mostPlayed.map((song, index) => (
              <TouchableOpacity
                key={song.id}
                onPress={() => navigation.navigate('Player', { song })}
                className="flex-row items-center py-3 bg-card/50 rounded-xl px-3 mb-2"
              >
                <View className="w-8 h-8 rounded-full bg-primary/20 justify-center items-center">
                  <Text className="text-primary text-sm font-bold">
                    {index + 1}
                  </Text>
                </View>
                <Image
                  source={{ uri: song.cover }}
                  className="w-12 h-12 rounded-lg ml-3"
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-white text-sm font-semibold"
                    numberOfLines={1}
                  >
                    {song.title}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs mt-1"
                    numberOfLines={1}
                  >
                    {song.artist} • {song.playCount} plays
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-400 text-xs">
                    {song.duration}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="flame" size={12} color="#e94560" />
                    <Text className="text-primary text-xs ml-1">Hot</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}