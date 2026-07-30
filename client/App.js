import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-dark">
      <Text className="text-primary text-3xl font-bold">
        🎵 MP3 App
      </Text>
      <Text className="text-white text-lg mt-4">
        Tailwind is Working! 🎉
      </Text>
      <StatusBar style="light" />
    </View>
  );
}