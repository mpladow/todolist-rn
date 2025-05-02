import { useQuery } from '@tanstack/react-query'
import { fetchTodosWithFilter, FilterType } from './api'

export const useTodosFilteredQuery = (filter: FilterType) => {
	return useQuery({ queryKey: ["todosFiltered", filter], queryFn: () => fetchTodosWithFilter(filter) })
}