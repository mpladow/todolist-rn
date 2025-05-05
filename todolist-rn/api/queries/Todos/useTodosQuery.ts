import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { fetchAllTodos, FilterType } from '../../api';
import { todoQueryOptions } from './todoQueryOptions';
import { useOptimistic } from 'react';

export const useTodosQuery = (filter: FilterType) => {
	const INTERVAL_MS = 1000 * 60 * 1; // 1 minute

	return useQuery({ queryKey: ['todos'], queryFn: fetchAllTodos, initialData: [], networkMode: 'offlineFirst' });
	//return useQuery({ queryKey: ["todos"], queryFn: () => fetchAllTodos(filter) })
} 