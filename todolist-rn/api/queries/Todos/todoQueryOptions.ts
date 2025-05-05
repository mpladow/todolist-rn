import { fetchAllTodos, FilterType } from '@/api/api';
import { queryOptions } from '@tanstack/react-query';

export const todoQueryOptions = (filter: FilterType) => {
	return queryOptions({ initialData: [], queryKey: ['todos'], queryFn: () => fetchAllTodos(filter) })

}