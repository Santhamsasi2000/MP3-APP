import './global.css';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PlayerProvider } from './src/context/PlayerContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import MiniPlayer from './src/components/MiniPlayer';

export default function App() {
  return (
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
  );
}