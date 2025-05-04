using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace todolist_api.Entities
{
    [Table("Todos")]
    public partial class ToDo
    {
        [Key]
        public int TodoId { get; set; }
        [MaxLength(500)]
        public string Title { get; set; }
        [AllowNull]
        public DateTime? CompletedAt { get; set; }
        [AllowNull]
        public DateTime? DeletedAt { get; set; }
    }
}
