import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);

  // Load saved theme
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) {
        setColorScheme(savedTheme);
      } else {
        setColorScheme('dark'); // Default dark
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    await AsyncStorage.setItem('@theme', newTheme);
  };

  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};