import './global.css';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { PlayerProvider } from './src/context/PlayerContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import MiniPlayer from './src/components/MiniPlayer';

export default function App() {
  useEffect(() => {
    if (!__DEV__ && Updates.isEnabled) {
      Updates.checkForUpdateAsync()
        .then((update) => {
          if (update.isAvailable) {
            return Updates.fetchUpdateAsync();
          }
        })
        .then((downloaded) => {
          if (downloaded) {
            setTimeout(() => {
              Updates.reloadAsync();
            }, 3000);
          }
        })
        .catch(() => {
          // Silent fail
        });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PlayerProvider>
          <NavigationContainer>
            <View style={{ flex: 1 }}>
              <StatusBar style="auto" />
              <AppNavigator />
              <MiniPlayer />
            </View>
          </NavigationContainer>
        </PlayerProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}