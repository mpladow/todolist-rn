
using Microsoft.EntityFrameworkCore;
using todolist_api.Entities;
using todolist_api.Interfaces;
using todolist_api.Services;

namespace todolist_api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();
            // Add services to the container.
            builder.Services.AddDbContext<_DbContext>(options =>
                options.UseInMemoryDatabase("_DbContext")
                //.UseSeeding((context, _) =>
                //{
                //    context.Set<ToDo>().Add(new ToDo { TodoId = 1, Title = "Create Project for RN", CompletedAt = new DateTime(), DeletedAt = null });
                //    context.Set<ToDo>().Add(new ToDo { TodoId = 2, Title = "Create Project for API", CompletedAt = null, DeletedAt = null });
                //    context.Set<ToDo>().Add(new ToDo { TodoId = 3, Title = "Create Project for API Tests", CompletedAt = null, DeletedAt = null });
                //    context.SaveChanges();
                //})
                );


            builder.Services.AddControllers();
            builder.Services.AddScoped<ITodoService, TodoService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<_DbContext>();
                dbContext.Database.EnsureDeleted(); // Ensures the database is reset
                dbContext.Database.EnsureCreated(); // Recreates the database and applies seed data
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
