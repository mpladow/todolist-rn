using Microsoft.EntityFrameworkCore;
using static todolist_api.Services.TodoService;
using todolist_api.Entities;
using todolist_api.Models;
using todolist_api.Interfaces;
using LinqKit;

namespace todolist_api.Services
{

    public class TodoService(_DbContext _db) : ITodoService
    {
        public async Task<List<TodoDto>> GetAllTodosAsync()
        {

            //TODO: switch to using automapper
            return await _db.Todos.Where(x => x.DeletedAt == null).Select(x => new TodoDto { TodoId = x.TodoId, Title = x.Title, CompletedAt = x.CompletedAt }).ToListAsync();


        }
        public async Task<int> AddTodoAsync(TodoDto todo)
        {
            var newTodo = new ToDo
            {
                Title = todo.Title,
            };
            _db.Todos.Add(newTodo);
            return await _db.SaveChangesAsync();
        }

        public async Task<bool> CompleteTodoAsync(int todoId, DateTime datetime)
        {
            var todoFound = _db.Todos.Find(todoId);
            if (todoFound != null)
            {
                todoFound.CompletedAt = datetime;
                await _db.SaveChangesAsync();
                return true;
            }
            else
            {
                return false;
            }
            throw new NotImplementedException();
        }
        public async Task<bool> OpenTodoAsync(int todoId)
        {
            var todoFound = _db.Todos.Find(todoId);
            if (todoFound != null)
            {
                todoFound.CompletedAt = null;
                _db.Update(todoFound);
                await _db.SaveChangesAsync();
                return true;
            }
            else
            {
                return false;
            }
        }
        public async Task<bool> DeleteTodoAsync(int todoId)
        {
            var TEST = _db.Todos.ToList();
            var todoFound = _db.Todos.FirstOrDefault(x => x.TodoId == todoId);
            if (todoFound != null)
            {
                todoFound.DeletedAt = DateTime.Now;
                _db.Update(todoFound);
                await _db.SaveChangesAsync();
                return true;
            }
            else
            {
                return false;
            }
        }



        public async Task<bool> UpdateTodoAsync(TodoDto todo)
        {
            throw new NotImplementedException();
        }
    }
}
