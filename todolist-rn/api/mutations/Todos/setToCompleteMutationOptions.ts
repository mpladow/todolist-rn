import { syncTodoList } from '@/api/api';
import { TodoDto } from '@/models/todosDto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';

export const useCompleteTodoMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      // Local state is updated immediately, API sync happens in background
      return id;
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);
      
      queryClient.setQueryData(['todos'], (old: TodoDto[] = []) => {
        return produce(old, (draft) => {
          const todoToUpdate = draft.find((x: TodoDto) => x.todoId === id);
          if (todoToUpdate) {
            todoToUpdate.completedAt = new Date();
          }
        });
      });
      
      return { previous };
    },
    onSuccess: async (data, variables, context) => {
      // After local update, attempt to sync with API in background
      const currentTodos: TodoDto[] = queryClient.getQueryData(['todos']) || [];
      try {
        await syncTodoList(currentTodos);
        console.log('Complete todo synced successfully');
      } catch (error) {
        console.log('Sync failed - keeping local changes (offline mode):', error);
        // Don't revert local changes - local storage is source of truth
      }
    },
    onError: (error, id, context) => {
      console.log('Complete todo mutation failed:', error);
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