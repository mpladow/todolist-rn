import { useColorScheme } from '@/hooks/useColorScheme';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import HomeScreen from './(tabs)';

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

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Offline-first configuration
        networkMode: 'offlineFirst',
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: (failureCount, error) => {
          // Only retry network errors, not client errors (4xx)
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('NetworkError') || 
              error.message.includes('fetch') ||
              error.name === 'TypeError') {
            return failureCount < 3;
          }
          return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch automatically - rely on cached data
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Offline-first mutations
        networkMode: 'offlineFirst',
        retry: (failureCount, error) => {
          // Retry network errors
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('NetworkError') ||
              error.message.includes('fetch') ||
              error.name === 'TypeError') {
            return failureCount < 3;
          }
          return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }));

  // Persist query cache on web using localStorage
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const persister = createSyncStoragePersister({ storage: window.localStorage });
      persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }
  }, [queryClient]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HomeScreen />
    </QueryClientProvider>
  );
}