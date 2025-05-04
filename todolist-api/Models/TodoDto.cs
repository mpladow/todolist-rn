namespace todolist_api.Models
{
    public class TodoDto
    {
        public int? TodoId { get; set; }
        public string Title { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
