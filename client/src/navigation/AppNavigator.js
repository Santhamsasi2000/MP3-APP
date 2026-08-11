import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';
import UploadScreen from '../screens/UploadScreen';
import RecentlyAddedScreen from '../screens/RecentlyAddedScreen';
import MusicDirectorsScreen from '../screens/MusicDirectorsScreen';
import MoviesAlbumsScreen from '../screens/MoviesAlbumsScreen';
import AllSongsScreen from '../screens/AllSongsScreen';
import DirectorSongsScreen from '../screens/DirectorSongsScreen';
import MovieSongsScreen from '../screens/MovieSongsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="RecentlyAdded" component={RecentlyAddedScreen} />
      <Stack.Screen name="MusicDirectors" component={MusicDirectorsScreen} />
      <Stack.Screen name="MoviesAlbums" component={MoviesAlbumsScreen} />
      <Stack.Screen name="AllSongs" component={AllSongsScreen} />
      <Stack.Screen name="DirectorSongs" component={DirectorSongsScreen} />
      <Stack.Screen name="MovieSongs" component={MovieSongsScreen} />
    </Stack.Navigator>
  );
}