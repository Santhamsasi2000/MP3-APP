import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadSong, getDirectors } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function UploadScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderChoice, setFolderChoice] = useState(''); // 'existing' or 'new'
  const [existingFolders, setExistingFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadedCount, setUploadedCount] = useState(0);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const data = await getDirectors();
      setExistingFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Pick multiple MP3 files
  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: true, // ⭐ Multiple files
      });

      if (result.canceled) return;

      const files = result.assets;

      // Filter valid MP3s
      const validFiles = files.filter((file) => {
        if (file.size > 50 * 1024 * 1024) {
          Alert.alert('File Too Large', `${file.name} is over 50MB`);
          return false;
        }
        return file.name.toLowerCase().endsWith('.mp3');
      });

      if (validFiles.length === 0) {
        Alert.alert('No Valid Files', 'Please select MP3 files under 50MB');
        return;
      }

      setSelectedFiles(validFiles);
    } catch (error) {
      Alert.alert('Error', 'Could not pick files: ' + error.message);
    }
  };

  // Detect category from folder name
  const detectCategory = (folderName) => {
    return folderName.toLowerCase().includes('bgm') ? 'bgm' : 'song';
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select MP3 files');
      return;
    }

    // Determine folder
    let folderName = '';
    if (folderChoice === 'existing') {
      if (!selectedFolder) {
        Alert.alert('Select Folder', 'Please choose an existing folder');
        return;
      }
      folderName = selectedFolder;
    } else if (folderChoice === 'new') {
      if (!newFolderName.trim()) {
        Alert.alert('Folder Name', 'Please enter a folder name');
        return;
      }
      folderName = newFolderName.trim();
    } else {
      Alert.alert('Choose Option', 'Select existing or new folder');
      return;
    }

    const category = detectCategory(folderName);

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });
    setUploadedCount(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress({ current: i + 1, total: selectedFiles.length });

      try {
        // Extract title from filename (remove .mp3)
        const title = file.name.replace(/\.mp3$/i, '');

        const metadata = {
          title: title,
          artist: 'Unknown', // Auto-detect from metadata later
          album: folderName,
          musicDirector: folderName,
          movieName: '',
          category: category,
        };

        const result = await uploadSong(
          file.uri,
          file.name,
          metadata,
          null // No individual progress
        );

        if (result.success) {
          successCount++;
          setUploadedCount(prev => prev + 1);
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        failCount++;
      }
    }

    setUploading(false);

    Alert.alert(
      '🎉 Upload Complete',
      `✅ Uploaded: ${successCount}\n❌ Failed: ${failCount}\n📁 Folder: ${folderName}`,
      [
        { text: 'Upload More', onPress: () => resetForm() },
        { text: 'Go Home', onPress: () => navigation.goBack() },
      ]
    );
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setFolderChoice('');
    setSelectedFolder('');
    setNewFolderName('');
    setUploadedCount(0);
    setUploadProgress({ current: 0, total: 0 });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-white dark:bg-dark"
      style={{ paddingTop: 10 }}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#e94560" />
        </TouchableOpacity>
        <Text className="text-gray-900 dark:text-white text-xl font-bold ml-4">
          Upload Songs
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* File Picker */}
        <TouchableOpacity
          onPress={pickFiles}
          disabled={uploading}
          className="mt-4"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedFiles.length > 0 ? ['#4caf50', '#2e7d32'] : ['#e94560', '#533483']}
            style={{
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={selectedFiles.length > 0 ? 'checkmark-circle' : 'cloud-upload'}
              size={50}
              color="#fff"
            />
            <Text className="text-white text-lg font-bold mt-2">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} Files Selected`
                : 'Tap to Select MP3 Files'}
            </Text>
            <Text className="text-white text-xs mt-1 opacity-80">
              {selectedFiles.length > 0 ? 'Tap to change' : 'You can select multiple files'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <View className="mt-4">
            <Text className="text-gray-900 dark:text-white font-bold mb-2">
              Selected Files ({selectedFiles.length})
            </Text>
            <View className="bg-gray-100 dark:bg-card rounded-xl p-3 max-h-40">
              <ScrollView>
                {selectedFiles.map((file, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <View className="flex-1 mr-2">
                      <Text
                        className="text-gray-900 dark:text-white text-sm"
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </View>
                    {!uploading && (
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <Ionicons name="close-circle" size={20} color="#e94560" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Folder Choice */}
        {selectedFiles.length > 0 && (
          <View className="mt-6">
            <Text className="text-gray-900 dark:text-white font-bold mb-3">
              Choose Folder
            </Text>

            {/* Existing / New Folder Buttons */}
            <View className="flex-row gap-2 mb-3">
              <TouchableOpacity
                onPress={() => setFolderChoice('existing')}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  folderChoice === 'existing'
                    ? 'bg-primary border-primary'
                    : 'bg-gray-100 dark:bg-card border-transparent'
                }`}
                disabled={uploading}
              >
                <Ionicons
                  name="folder"
                  size={24}
                  color={folderChoice === 'existing' ? '#fff' : '#e94560'}
                  style={{ alignSelf: 'center' }}
                />
                <Text
                  className={`text-center font-semibold mt-2 ${
                    folderChoice === 'existing'
                      ? 'text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  Existing Folder
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFolderChoice('new')}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  folderChoice === 'new'
                    ? 'bg-primary border-primary'
                    : 'bg-gray-100 dark:bg-card border-transparent'
                }`}
                disabled={uploading}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={folderChoice === 'new' ? '#fff' : '#e94560'}
                  style={{ alignSelf: 'center' }}
                />
                <Text
                  className={`text-center font-semibold mt-2 ${
                    folderChoice === 'new'
                      ? 'text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  New Folder
                </Text>
              </TouchableOpacity>
            </View>

            {/* Existing Folder Selector */}
            {folderChoice === 'existing' && (
              <TouchableOpacity
                onPress={() => setShowFolderModal(true)}
                disabled={uploading}
                className="bg-gray-100 dark:bg-card p-4 rounded-xl flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Selected Folder
                  </Text>
                  <Text className="text-gray-900 dark:text-white font-semibold mt-1">
                    {selectedFolder || 'Tap to select...'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#e94560" />
              </TouchableOpacity>
            )}

            {/* New Folder Name Input */}
            {folderChoice === 'new' && (
              <View>
                <TextInput
                  className="bg-gray-100 dark:bg-card text-gray-900 dark:text-white p-4 rounded-xl"
                  placeholder="Enter folder name (e.g., A. R. Rahman BGM)"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  editable={!uploading}
                />
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  💡 Add "BGM" in name for BGM folder
                </Text>
              </View>
            )}

            {/* Auto-detected Category */}
            {(selectedFolder || newFolderName) && (
              <View className="bg-primary/10 rounded-xl p-3 mt-3 flex-row items-center">
                <Ionicons
                  name={detectCategory(selectedFolder || newFolderName) === 'bgm' ? 'musical-note' : 'musical-notes'}
                  size={20}
                  color="#e94560"
                />
                <Text className="text-primary font-semibold ml-2">
                  Auto-detected: {detectCategory(selectedFolder || newFolderName).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Upload Progress */}
        {uploading && (
          <View className="mt-6 bg-gray-100 dark:bg-card p-4 rounded-xl">
            <Text className="text-gray-900 dark:text-white font-bold text-center mb-2">
              Uploading... {uploadedCount}/{uploadProgress.total}
            </Text>
            <View className="h-3 bg-gray-200 dark:bg-dark rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{
                  width: `${(uploadedCount / uploadProgress.total) * 100}%`,
                }}
              />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-xs text-center mt-2">
              Please wait...
            </Text>
          </View>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && !uploading && (
          <TouchableOpacity
            onPress={handleUpload}
            className="mt-6"
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#e94560', '#533483']}
              style={{
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="cloud-upload" size={22} color="#fff" />
              <Text className="text-white font-bold ml-2 text-lg">
                Upload {selectedFiles.length} Song{selectedFiles.length > 1 ? 's' : ''}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Folder Selection Modal */}
      <Modal
        visible={showFolderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFolderModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setShowFolderModal(false)}
          activeOpacity={1}
        >
          <View className="bg-white dark:bg-dark rounded-t-3xl p-6 max-h-96">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </View>

            <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">
              Select Folder ({existingFolders.length})
            </Text>

            <ScrollView>
              {existingFolders.map((folder, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedFolder(folder._id);
                    setShowFolderModal(false);
                  }}
                  className={`p-4 rounded-xl mb-2 flex-row items-center justify-between ${
                    selectedFolder === folder._id
                      ? 'bg-primary'
                      : 'bg-gray-100 dark:bg-card'
                  }`}
                >
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        selectedFolder === folder._id
                          ? 'text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}
                      numberOfLines={1}
                    >
                      {folder._id}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${
                        selectedFolder === folder._id
                          ? 'text-white opacity-80'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {folder.count} songs
                    </Text>
                  </View>
                  {selectedFolder === folder._id && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}