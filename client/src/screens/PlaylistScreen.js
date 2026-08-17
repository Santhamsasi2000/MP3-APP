import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMiniPlayerPadding } from '../hooks/useMiniPlayerPadding';


export default function PlaylistScreen({ route, navigation }) {
  const { playlist } = route.params;
  const bottomPadding = useMiniPlayerPadding();
  

  return (
    <View className="flex-1 bg-dark">
      {/* Gradient Header */}
      <LinearGradient
        colors={['#e94560', '#0f0f1e']}
        style={{ paddingBottom: 20 }}
      >
        <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-dark"  style={{ paddingTop: 10 }}>
          {/* Top Bar */}
          <View className="flex-row justify-between px-5 py-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Playlist Info */}
          <View className="items-center px-5">
            <Image
              source={{ uri: playlist.cover }}
              className="w-52 h-52 rounded-2xl"
            />
            <Text className="text-white text-2xl font-bold mt-5">
              {playlist.name}
            </Text>
            <Text className="text-white opacity-80 mt-1">
              {playlist.songCount} songs
            </Text>

            {/* Actions */}
            <View className="flex-row items-center mt-5" style={{ gap: 15 }}>
              <TouchableOpacity className="flex-row items-center bg-white/20 px-5 py-2.5 rounded-full">
                <Ionicons name="shuffle" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">Shuffle</Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-14 h-14 rounded-full bg-white justify-center items-center">
                <Ionicons name="play" size={26} color="#0f0f1e" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Song List */}
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding }} className="flex-1 px-5 pt-5">
        {songs.map((song, index) => (
          <TouchableOpacity
            key={song.id}
            onPress={() => navigation.navigate('Player', { song })}
            className="flex-row items-center py-3"
          >
            <Text className="text-gray-400 text-sm w-6">{index + 1}</Text>
            <Image
              source={{ uri: song.cover }}
              className="w-12 h-12 rounded-lg ml-2"
            />
            <View className="flex-1 ml-3">
              <Text className="text-white text-base font-semibold">
                {song.title}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">{song.artist}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}