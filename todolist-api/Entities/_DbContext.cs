using Microsoft.EntityFrameworkCore;

namespace todolist_api.Entities
{
    public partial class _DbContext : DbContext
    {
        public _DbContext()
        {
        }

        public _DbContext(DbContextOptions<_DbContext> options)
            : base(options)
        {
        }
        public virtual DbSet<ToDo> Todos { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
