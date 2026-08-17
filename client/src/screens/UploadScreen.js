import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadSong } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useMiniPlayerPadding } from '../hooks/useMiniPlayerPadding';

export default function UploadScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const bottomPadding = useMiniPlayerPadding();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [musicDirector, setMusicDirector] = useState('');
  const [movieName, setMovieName] = useState('');
  const [category, setCategory] = useState('song');

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (file.size > 50 * 1024 * 1024) {
        Alert.alert(
          'File Too Large',
          'Maximum file size is 50 MB. Your file is ' +
            (file.size / 1024 / 1024).toFixed(2) +
            ' MB'
        );
        return;
      }

      if (!file.name.toLowerCase().endsWith('.mp3')) {
        Alert.alert('Invalid File', 'Please select MP3 file only');
        return;
      }

      setSelectedFile(file);
      const nameWithoutExt = file.name.replace('.mp3', '');
      setTitle(nameWithoutExt);
    } catch (error) {
      Alert.alert('Error', 'Could not pick file: ' + error.message);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select an MP3 file first');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter song title');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const metadata = {
        title: title.trim(),
        artist: artist.trim() || 'Unknown',
        album: album.trim() || 'Unknown',
        musicDirector: musicDirector.trim() || 'Unknown',
        movieName: movieName.trim(),
        category: category,
      };

      const result = await uploadSong(
        selectedFile.uri,
        selectedFile.name,
        metadata,
        (percent) => setProgress(percent)
      );

      if (result.success) {
        Alert.alert(
          '🎉 Success!',
          `"${result.song.title}" uploaded successfully!`,
          [
            { text: 'Upload Another', onPress: () => resetForm() },
            { text: 'Go Home', onPress: () => navigation.goBack() },
          ]
        );
      } else {
        Alert.alert('Upload Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setArtist('');
    setAlbum('');
    setMusicDirector('');
    setMovieName('');
    setCategory('song');
    setProgress(0);
  };

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-white dark:bg-dark"  style={{ paddingTop: 10 }}
    >
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#e94560" />
        </TouchableOpacity>
        <Text className="text-gray-900 dark:text-white text-xl font-bold ml-4">
          Upload Song
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* File Picker */}
        <TouchableOpacity
          onPress={pickFile}
          disabled={uploading}
          className="mt-4"
        >
          <LinearGradient
            colors={selectedFile ? ['#4caf50', '#2e7d32'] : ['#e94560', '#533483']}
            style={{
              borderRadius: 16,
              padding: 30,
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={selectedFile ? 'checkmark-circle' : 'cloud-upload'}
              size={60}
              color="#fff"
            />
            <Text className="text-white text-lg font-bold mt-3">
              {selectedFile ? 'File Selected!' : 'Tap to Select MP3'}
            </Text>
            {selectedFile && (
              <>
                <Text className="text-white text-sm mt-2 opacity-90">
                  {selectedFile.name}
                </Text>
                <Text className="text-white text-xs mt-1 opacity-75">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {selectedFile && (
          <View className="mt-6">
            <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">
              Song Details
            </Text>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Song Title *
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-card text-gray-900 dark:text-white p-4 rounded-xl"
                placeholder="Enter song title"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={title}
                onChangeText={setTitle}
                editable={!uploading}
              />
            </View>

            {/* Artist */}
            <View className="mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Artist / Singer
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-card text-gray-900 dark:text-white p-4 rounded-xl"
                placeholder="Artist name"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={artist}
                onChangeText={setArtist}
                editable={!uploading}
              />
            </View>

            {/* Movie */}
            <View className="mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Album / Movie
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-card text-gray-900 dark:text-white p-4 rounded-xl"
                placeholder="Album or movie name"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={movieName}
                onChangeText={(text) => {
                  setMovieName(text);
                  setAlbum(text);
                }}
                editable={!uploading}
              />
            </View>

            {/* Director */}
            <View className="mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Music Director
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-card text-gray-900 dark:text-white p-4 rounded-xl"
                placeholder="Music director name"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={musicDirector}
                onChangeText={setMusicDirector}
                editable={!uploading}
              />
            </View>

            {/* Category */}
            <View className="mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Category
              </Text>
              <View className="flex-row" style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setCategory('song')}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    category === 'song'
                      ? 'bg-primary border-primary'
                      : 'bg-gray-100 dark:bg-card border-transparent'
                  }`}
                  disabled={uploading}
                >
                  <Text 
                    className={
                      category === 'song'
                        ? 'text-white text-center font-semibold'
                        : 'text-gray-900 dark:text-white text-center font-semibold'
                    }
                  >
                    🎵 Song
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCategory('bgm')}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    category === 'bgm'
                      ? 'bg-primary border-primary'
                      : 'bg-gray-100 dark:bg-card border-transparent'
                  }`}
                  disabled={uploading}
                >
                  <Text 
                    className={
                      category === 'bgm'
                        ? 'text-white text-center font-semibold'
                        : 'text-gray-900 dark:text-white text-center font-semibold'
                    }
                  >
                    🎼 BGM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress */}
            {uploading && (
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-900 dark:text-white text-sm">
                    Uploading...
                  </Text>
                  <Text className="text-primary font-bold">{progress}%</Text>
                </View>
                <View className="h-3 bg-gray-200 dark:bg-card rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              onPress={handleUpload}
              disabled={uploading}
              className="mt-4"
            >
              <LinearGradient
                colors={uploading ? ['#666', '#444'] : ['#e94560', '#533483']}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                {uploading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#fff" />
                    <Text className="text-white font-bold ml-2">
                      Uploading to Cloud...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="cloud-upload" size={20} color="#fff" />
                    <Text className="text-white font-bold ml-2 text-lg">
                      Upload Song
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}