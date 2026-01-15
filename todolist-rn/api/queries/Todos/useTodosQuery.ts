import { TodoDto } from '@/models/todosDto';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { fetchAllTodos, syncTodoList } from '../../api';

export const useTodosQuery = () => {
	const queryClient = useQueryClient();
	
	const query = useQuery({ 
		queryKey: ['todos'], 
		queryFn: () => fetchAllTodos(), 
		initialData: [], 
		networkMode: 'offlineFirst',
		// Prioritize cached data - consider stale for longer to rely on cache
		staleTime: 1000 * 60 * 30, // Consider fresh for 30 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
		// Don't fetch automatically - let optimistic updates handle local state
		enabled: Platform.OS === 'web', // Fetch on web to populate initial data
		refetchOnMount: Platform.OS === 'web' ? 'always' : false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
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
		// Keep previous data on error
		placeholderData: (previousData) => previousData,
	});

	// Background sync when app becomes active (mobile) or page focus (web)
	useEffect(() => {
		const handleAppStateChange = async (nextAppState: string) => {
			if (nextAppState === 'active') {
				const localTodos: TodoDto[] = queryClient.getQueryData(['todos']) || [];
				if (localTodos.length > 0) {
					try {
						await syncTodoList(localTodos);
						console.log('Background sync successful');
						query.refetch();
					} catch (error) {
						console.log('Background sync failed (using local data):', error);
					}
				} else {
					try {
						query.refetch();
					} catch (error) {
						console.log('Background fetch failed:', error);
					}
				}
			}
		};

		const handleWebFocus = async () => {
			const localTodos: TodoDto[] = queryClient.getQueryData(['todos']) || [];
			if (localTodos.length > 0) {
				try {
					await syncTodoList(localTodos);
					console.log('Web focus sync successful');
					query.refetch();
				} catch (error) {
					console.log('Web focus sync failed (using local data):', error);
				}
			} else {
				// If no local todos, ensure we fetch when focused
				query.refetch();
			}
		};

		let appStateSub: { remove: () => void } | undefined;
		if (Platform.OS !== 'web') {
			appStateSub = AppState.addEventListener('change', handleAppStateChange);
		} else if (typeof window !== 'undefined') {
			window.addEventListener('focus', handleWebFocus);
		}

		return () => {
			if (appStateSub) {
				appStateSub.remove();
			}
			if (Platform.OS === 'web' && typeof window !== 'undefined') {
				window.removeEventListener('focus', handleWebFocus);
			}
		};
	}, [queryClient, query]);

	return query;
}; 