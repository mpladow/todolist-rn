import { fetchAllTodos } from '@/api/api';
import { queryOptions } from '@tanstack/react-query';

export const todoQueryOptions = () => {
	return queryOptions({ 
		initialData: [], 
		queryKey: ['todos'], 
		queryFn: () => fetchAllTodos(),
		// Offline-first configuration - prioritize cached data
		networkMode: 'offlineFirst',
		// Cache for longer to rely more on local storage
		staleTime: 1000 * 60 * 30, // 30 minutes
		// Keep in cache for 7 days
		gcTime: 1000 * 60 * 60 * 24 * 7,
		// Don't refetch automatically - let local storage be source of truth
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: 'always', // Only refetch when reconnecting
		// Retry on network error
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
		// Keep previous data on error to maintain local state
		placeholderData: (previousData) => previousData,
	})
}