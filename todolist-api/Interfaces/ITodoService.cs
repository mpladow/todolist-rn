using todolist_api.Models;

namespace todolist_api.Interfaces
{
    public interface ITodoService
    {
        Task<List<TodoDto>> GetAllTodosByFilterAsync(string filter);
        Task<int> AddTodoAsync(TodoDto todo);
        Task<bool> UpdateTodoAsync(TodoDto todo);
        Task<bool> DeleteTodoAsync(int todoId);
        Task<bool> CompleteTodoAsync(int todoId, DateTime datetime);
        Task<bool> OpenTodoAsync(int todoId);

    }
}
