import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { fetchAllTodos, FilterType } from '../../api';
import { todoQueryOptions } from './todoQueryOptions';

export const useTodosQuery = (filter: FilterType) => {
	const INTERVAL_MS = 1000 * 60 * 1; // 1 minute

	return useQuery({ queryKey: ['todos', filter], queryFn: () => fetchAllTodos(filter), refetchOnMount: 'always', refetchOnWindowFocus: true });
	//return useQuery({ queryKey: ["todos"], queryFn: () => fetchAllTodos(filter) })
} 