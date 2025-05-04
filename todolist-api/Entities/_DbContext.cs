using Microsoft.EntityFrameworkCore;

namespace todolist_api.Entities
{
    public partial class _DbContext : DbContext
    {
        public _DbContext(DbContextOptions<_DbContext> options)
            : base(options)
        {
        }
        public virtual DbSet<ToDo> Todos { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ToDo>().HasData(
                new ToDo { TodoId = 1, Title = "Create Project for RN", CompletedAt = new DateTime(), DeletedAt = null },
                new ToDo { TodoId = 2, Title = "Create Project for API", CompletedAt = null, DeletedAt = null },
                new ToDo { TodoId = 3, Title = "Create Project for API Tests", CompletedAt = null, DeletedAt = null }

            );
        }

    }
}
