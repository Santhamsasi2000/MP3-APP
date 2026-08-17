import './global.css';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { PlayerProvider } from './src/context/PlayerContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import MiniPlayer from './src/components/MiniPlayer';

export default function App() {
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    // ⭐ SHOW DEBUG INFO ON APP OPEN
    showDebugInfo();
    checkAndApplyUpdate();
  }, []);

  function showDebugInfo() {
    setTimeout(() => {
      Alert.alert(
        '🔍 Update Debug Info',
        `Development: ${__DEV__}\n\n` +
        `Updates Enabled: ${Updates.isEnabled}\n\n` +
        `Channel: ${Updates.channel || 'NONE ❌'}\n\n` +
        `Runtime Version: ${Updates.runtimeVersion || 'NONE ❌'}\n\n` +
        `Update ID: ${Updates.updateId?.substring(0, 12) || 'NONE ❌'}\n\n` +
        `Is Embedded: ${Updates.isEmbeddedLaunch}`,
        [{ text: 'OK' }]
      );
    }, 2000);
  }

  async function checkAndApplyUpdate() {
    if (__DEV__) {
      console.log('🔧 DEV mode - skipping updates');
      return;
    }

    try {
      setUpdateStatus('Checking for updates...');
      console.log('🔍 Checking for update...');
      
      const update = await Updates.checkForUpdateAsync();
      
      console.log('Update available:', update.isAvailable);
      
      if (update.isAvailable) {
        Alert.alert('Update Found!', 'Downloading now...');
        setUpdateStatus('Downloading update...');
        
        await Updates.fetchUpdateAsync();
        console.log('✅ Update downloaded');
        
        setUpdateStatus('Applying update...');
        
        setTimeout(async () => {
          console.log('🔄 Restarting app...');
          await Updates.reloadAsync();
        }, 1000);
      } else {
        console.log('✅ No updates available');
        setUpdateStatus('');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      Alert.alert('Update Error', error.message);
      setUpdateStatus('');
    }
  }

  if (updateStatus.includes('Downloading') || updateStatus.includes('Applying')) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f1e',
      }}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={{ 
          color: 'white', 
          marginTop: 20, 
          fontSize: 16,
          fontWeight: 'bold',
        }}>
          {updateStatus}
        </Text>
      </View>
    );
  }

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