import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './(tabs)';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { fetchAllTodos } from '@/api/api';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  });

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  });

  //   const asyncStoragePersistor = {
  //     persistClient: async (client: any) => {
  //       try {
  //         await AsyncStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
  //       } catch (error) {
  //         console.error('Error persisting query client:', error);
  //       }
  //     },
  //     restoreClient: async () => {
  //       try {
  //         const cache = await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
  //         return cache ? JSON.parse(cache) : undefined;
  //       } catch (error) {
  //         console.error('Error restoring query client:', error);
  //         return undefined;
  //       }
  //     },
  //     removeClient: async () => {
  //       try {
  //         await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
  //       } catch (error) {
  //         console.error('Error removing query client:', error);
  //       }
  //     },
  //   };

    persistQueryClient({
      queryClient,
      persister: persister,
    });

  if (!loaded) {
    return null;
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {/* <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" /> */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <HomeScreen />
      {/* <StatusBar style="auto" backgroundColor={colorScheme === 'dark' ? '#000' : '#fff'} /> */}
    </PersistQueryClientProvider>
  );
}
