import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ route, navigation }) {
  const { song } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <LinearGradient
      colors={['#e94560', '#0f0f1e', '#0f0f1e']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 p-5">
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="flex-row justify-between items-center py-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={30} color="#fff" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white text-xs opacity-70">
              PLAYING FROM ALBUM
            </Text>
            <Text className="text-white text-sm font-bold mt-1">
              {song.album}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View className="items-center mt-8">
          <Image
            source={{ uri: song.cover }}
            style={{
              width: width - 80,
              height: width - 80,
              borderRadius: 20,
            }}
          />
        </View>

        {/* Song Info */}
        <View className="flex-row justify-between items-center mt-10 px-2">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">{song.title}</Text>
            <Text className="text-white opacity-70 text-base mt-1">
              {song.artist}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={30}
              color={isFavorite ? '#e94560' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="mt-8 px-2">
          <View className="h-1 bg-white/20 rounded-full relative">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: '35%' }}
            />
            <View
              className="w-3 h-3 bg-white rounded-full absolute"
              style={{ top: -4, left: '35%' }}
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-white opacity-70 text-xs">1:23</Text>
            <Text className="text-white opacity-70 text-xs">
              {song.duration}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row justify-around items-center mt-8 px-2">
          <TouchableOpacity>
            <Ionicons name="shuffle" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="play-skip-back" size={35} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-white justify-center items-center"
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={35}
              color="#0f0f1e"
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="play-skip-forward" size={35} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="repeat" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View className="flex-row justify-around mt-10 pb-5">
          <TouchableOpacity className="p-2">
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="download-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="list" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}