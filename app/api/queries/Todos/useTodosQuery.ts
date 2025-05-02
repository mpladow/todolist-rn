import { useQuery } from '@tanstack/react-query';
import { fetchAllTodos } from '../../api';

type Endpoint = "GetAllTodos"
export const useTodosQuery = () => {
	return useQuery({ queryKey: ["todos"], queryFn: fetchAllTodos })
}