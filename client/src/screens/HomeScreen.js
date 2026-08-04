import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { songs, categories, playlists } from '../data/dummyData';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-dark">
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-5 pb-3">
          <View>
            <Text className="text-gray-400 text-sm">Good Evening</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              Welcome Back! 👋
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="person-circle" size={40} color="#e94560" />
          </TouchableOpacity>
        </View>

        {/* Featured Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Player', { song: songs[0] })}
          className="mx-5 mt-5"
        >
          <LinearGradient
            colors={['#e94560', '#533483']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 20, minHeight: 160 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xs font-bold opacity-80">
                  TRENDING NOW
                </Text>
                <Text className="text-white text-2xl font-bold mt-2">
                  Top Hits 2024
                </Text>
                <Text className="text-white opacity-80 mt-1 mb-4">
                  50 songs • 3h 22min
                </Text>
                <TouchableOpacity className="flex-row items-center bg-white/25 px-4 py-2 rounded-full self-start">
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text className="text-white font-bold ml-1">Play Now</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: 'https://picsum.photos/150/150?random=20' }}
                className="w-32 h-32 rounded-2xl ml-4"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <View className="mt-8">
          <Text className="text-white text-xl font-bold px-5 mb-4">
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={{ backgroundColor: category.color }}
                className="w-28 h-28 rounded-2xl p-4 justify-between mr-3"
              >
                <Ionicons name={category.icon} size={30} color="#fff" />
                <Text className="text-white text-base font-bold">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Songs */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <Text className="text-white text-xl font-bold">Popular Songs</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm">See All</Text>
            </TouchableOpacity>
          </View>

          {songs.map((song) => (
            <TouchableOpacity
              key={song.id}
              onPress={() => navigation.navigate('Player', { song })}
              className="flex-row items-center px-5 py-2.5"
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
              <Text className="text-gray-400 text-xs mr-2">
                {song.duration}
              </Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Playlists */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <Text className="text-white text-xl font-bold">Your Playlists</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                onPress={() => navigation.navigate('Playlist', { playlist })}
                className="w-36 mr-4"
              >
                <Image
                  source={{ uri: playlist.cover }}
                  className="w-36 h-36 rounded-2xl"
                />
                <Text className="text-white text-base font-semibold mt-2">
                  {playlist.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {playlist.songCount} songs
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}