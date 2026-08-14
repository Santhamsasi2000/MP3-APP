import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function ScreenWrapper({ 
  children, 
  showMiniPlayerSpace = true,
  edges = ['top', 'left', 'right'] 
}) {
  const { isDark } = useTheme();

  return (
    <SafeAreaView 
      edges={edges}
      style={{ 
        flex: 1, 
        backgroundColor: isDark ? '#0f0f1e' : '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <View style={{ 
        flex: 1,
        paddingBottom: showMiniPlayerSpace ? 80 : 0, // Space for Mini Player
      }}>
        {children}
      </View>
    </SafeAreaView>
  );
}