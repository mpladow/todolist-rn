import { useQueryClient } from '@tanstack/react-query'

export const useRefresh = () => {
	const queryClient = useQueryClient();
	return (query: string) => queryClient.invalidateQueries(query);
}