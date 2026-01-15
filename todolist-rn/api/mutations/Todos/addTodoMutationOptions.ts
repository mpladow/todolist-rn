import { syncTodoList } from '@/api/api';
import { TodoDto } from '@/models/todosDto';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useAddTodoMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (newTodo: TodoDto) => {
			// Local state is updated immediately, API sync happens in background
			return newTodo;
		},
		onMutate: async (newTodo: TodoDto) => {
			await queryClient.cancelQueries({ queryKey: ['todos'] });

			const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);

			// Add to local state immediately with generated ID
			const todoWithId = {
				...newTodo,
				todoId: Math.random() + Math.random(), // Temporary ID until synced with server
			};

			queryClient.setQueryData(['todos'], (old: TodoDto[] = []) => {
				return [...old, todoWithId];
			});
			return { previous, newTodo: todoWithId };
		},
		onSuccess: async (data, variables, context) => {
			// After local update, attempt to sync with API in background
			const currentTodos: TodoDto[] = queryClient.getQueryData(['todos']) || [];
			try {
				await syncTodoList(currentTodos);
				console.log('Add todo synced successfully');
			} catch (error) {
				console.log('Sync failed - keeping local changes (offline mode):', error);
				// Don't revert local changes - local storage is source of truth
				// The sync will be retried on next app activation or connection
			}
		},
		onError: (error, newTodo, context) => {
			console.log('Add todo mutation failed:', error);
			// Only revert if the local mutation itself failed, not if sync failed
			if (context?.previous) {
				queryClient.setQueryData(['todos'], context.previous);
			}
		},
		retry: (failureCount, error) => {
			return failureCount < 3 && !error.message.includes('4');
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};
