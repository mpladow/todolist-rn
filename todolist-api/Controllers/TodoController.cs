using Microsoft.AspNetCore.Mvc;
using todolist_api.Interfaces;
using todolist_api.Models;
using todolist_api.Services;

namespace todolist_api.Controllers
{
    public class TodoController(ITodoService todoService ):ControllerBase
    {
        //[HttpGet(Name = "GetAllTodos")]
        //public async Task<ActionResult<List<TodoDto>>> GetAllTodos()
        //{
        //    var todos = await todoService.GetAllTodosAsync();
        //    return Ok(todos);
        //}
        [HttpGet(Name = "GetAllTodosByFilter")]
        public async Task<ActionResult<List<TodoDto>>> GetAllTodosByFilter([FromQuery] string filter)
        {
            var todos = await todoService.GetAllTodosByFilterAsync(filter);
            return Ok(todos);
        }
        [HttpPost(Name = "AddTodo")]
        public async Task<IActionResult> AddTodo([FromBody] TodoDto todo)
        {
            if (todo == null)
            {
                return BadRequest("Todo cannot be null");
            }
            if (String.IsNullOrEmpty(todo.Title))
            {
                return BadRequest("No title");
            }
            try
            {
                await todoService.AddTodoAsync(todo);
                return CreatedAtAction(nameof(AddTodo), new { id = todo.TodoId }, todo);
            }
            catch
            {
                throw new Exception("Unable to add todo item");
            }
        }
        [HttpDelete(Name = "DeleteTodo")]
        public async Task<IActionResult> DeleteTodo([FromQuery] int todoId)
        {
            if (todoId <= 0)
            {
                return BadRequest("Invalid Todo ID");
            }
            try
            {
                var result = await todoService.DeleteTodoAsync(todoId);
                if (result)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound("Todo not found");
                }
            }
            catch
            {
                throw new Exception("Unable to delete todo item");
            }
        }
        [HttpPut(Name = "CompleteTodo")]
        public async Task<IActionResult> CompleteTodo([FromQuery] int todoId, [FromBody] DateTime datetime)
        {
            if (todoId <= 0)
            {
                return BadRequest("Invalid Todo ID");
            }
            try
            {
                var result = await todoService.CompleteTodoAsync(todoId, datetime);
                if (result)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound("Todo not found");
                }
            }
            catch
            {
                throw new Exception("Unable to complete todo item");
            }
        }
        [HttpPut(Name = "OpenTodo")]
        public async Task<IActionResult> OpenTodo([FromBody] int todoId)
        {
            if (todoId <= 0)
            {
                return BadRequest("Invalid Todo ID");
            }
            try
            {
                var result = await todoService.OpenTodoAsync(todoId);
                if (result)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound("Todo not found");
                }
            }
            catch
            {
                throw new Exception("Unable to open todo item");
            }
        }
    }
}
