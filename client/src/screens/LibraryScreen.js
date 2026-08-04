import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { playlists, songs } from '../data/dummyData';

export default function LibraryScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5">
        <Text className="text-white text-3xl font-bold">Your Library</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Access */}
        <View className="flex-row px-5 mt-5" style={{ gap: 10 }}>
          <TouchableOpacity className="flex-1 flex-row items-center bg-card p-4 rounded-xl">
            <Ionicons name="heart" size={22} color="#e94560" />
            <Text className="text-white font-semibold ml-3">Liked Songs</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center bg-card p-4 rounded-xl">
            <Ionicons name="download" size={22} color="#4caf50" />
            <Text className="text-white font-semibold ml-3">Downloads</Text>
          </TouchableOpacity>
        </View>

        {/* Playlists */}
        <View className="mt-6 px-5">
          <Text className="text-white text-xl font-bold mb-4">Playlists</Text>

          {playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              onPress={() => navigation.navigate('Playlist', { playlist })}
              className="flex-row items-center py-3"
            >
              <Image
                source={{ uri: playlist.cover }}
                className="w-16 h-16 rounded-lg"
              />
              <View className="flex-1 ml-4">
                <Text className="text-white text-base font-semibold">
                  {playlist.name}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Playlist • {playlist.songCount} songs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recently Played */}
        <View className="mt-6 px-5">
          <Text className="text-white text-xl font-bold mb-4">
            Recently Played
          </Text>

          {songs.slice(0, 4).map((song) => (
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
              <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}