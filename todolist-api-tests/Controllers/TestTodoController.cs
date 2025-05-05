using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using todolist_api.Controllers;
using todolist_api.Interfaces;
using todolist_api.Models;
using Xunit;

namespace todolist_api_tests.Controllers
{
    public class TestTodoController
    {
        private readonly Mock<ITodoService> _mockTodoService;
        private readonly TodoController _controller;

        public TestTodoController()
        {
            _mockTodoService = new Mock<ITodoService>();
            _controller = new TodoController(_mockTodoService.Object);
        }

        [Fact]
        public async Task GetAllTodos_ReturnsOkResult_WithListOfTodos()
        {
            // Arrange
            var todos = new List<TodoDto>
            {
                new TodoDto { TodoId = 1, Title = "Task 1", CompletedAt = null, DeletedAt = null },
                new TodoDto { TodoId = 2, Title = "Task 2", CompletedAt = null, DeletedAt = null }
            };
            _mockTodoService.Setup(service => service.GetAllTodosAsync())
                .ReturnsAsync(todos);

            // Act
            var result = await _controller.GetAllTodos();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedTodos = Assert.IsType<List<TodoDto>>(okResult.Value);
            Assert.Equal(2, returnedTodos.Count);
        }

        [Fact]
        public async Task GetAllTodos_ReturnsOkResult_WithEmptyList_WhenNoTodosExist()
        {
            // Arrange
            _mockTodoService.Setup(service => service.GetAllTodosAsync())
                .ReturnsAsync(new List<TodoDto>());

            // Act
            var result = await _controller.GetAllTodos();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedTodos = Assert.IsType<List<TodoDto>>(okResult.Value);
            Assert.Empty(returnedTodos);
        }

        [Fact]
        public async Task GetAllTodos_ThrowsException_WhenServiceFails()
        {
            // Arrange
            _mockTodoService.Setup(service => service.GetAllTodosAsync())
                .ThrowsAsync(new System.Exception("Service failure"));

            // Act & Assert
            await Assert.ThrowsAsync<System.Exception>(() => _controller.GetAllTodos());
        }
    }
}
