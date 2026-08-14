import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSongsByMovie } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { usePlayer, REPEAT_MODES } from '../context/PlayerContext';
import { useMiniPlayerPadding } from '../hooks/useMiniPlayerPadding';

export default function MovieSongsScreen({ route, navigation }) {
  const { movie } = route.params;
  const { isDark } = useTheme();
  const { playSong, setRepeatMode } = usePlayer();
  const bottomPadding = useMiniPlayerPadding();
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await getSongsByMovie(movie);
      setSongs(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
      navigation.navigate('Player', { song: songs[0], songList: songs });
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      const randomSong = songs[randomIndex];
      
      setRepeatMode(REPEAT_MODES.SHUFFLE);
      playSong(randomSong, songs);
      
      navigation.navigate('Player', { 
        song: randomSong, 
        songList: songs 
      });
    }
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
    <View className="flex-1 bg-white dark:bg-dark">
      <LinearGradient
        colors={['#e94560', isDark ? '#0f0f1e' : '#ffffff']}
        style={{ paddingBottom: 20 }}
      >
        <SafeAreaView edges={['top']}>
          <View className="flex-row justify-between px-5 pt-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="items-center px-5 mt-2">
            <View className="w-28 h-28 rounded-2xl bg-white/20 justify-center items-center">
              <Ionicons name="film" size={50} color="#fff" />
            </View>
            <Text 
              className="text-white text-xl font-bold mt-3 text-center" 
              numberOfLines={2}
            >
              {movie}
            </Text>
            <Text className="text-white opacity-80 mt-1 text-sm">
              {songs.length} songs
            </Text>

            {/* Play & Shuffle Buttons */}
            <View className="flex-row mt-4" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handlePlayAll}
                className="flex-row items-center bg-white px-6 py-2.5 rounded-full"
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={20} color="#0f0f1e" />
                <Text className="text-dark font-bold ml-2">
                  Play All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShuffle}
                className="flex-row items-center bg-white/30 px-6 py-2.5 rounded-full border border-white/50"
                activeOpacity={0.8}
              >
                <Ionicons name="shuffle" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">
                  Shuffle
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        {songs.map((song, index) => (
          <TouchableOpacity
            key={song._id}
            onPress={() => navigation.navigate('Player', { song, songList: songs })}
            className="flex-row items-center py-3"
            activeOpacity={0.7}
          >
            <Text className="text-gray-500 dark:text-gray-400 w-8">
              {index + 1}
            </Text>
            <View className="w-12 h-12 rounded-lg bg-primary/20 justify-center items-center">
              <Ionicons name="musical-note" size={20} color="#e94560" />
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
                {song.artist}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="play-circle" size={28} color="#e94560" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}