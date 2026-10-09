using System;

namespace EPrescriptions.Domain.Entities
{
    public class OwnerAuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
        public DateTime TimestampLocal { get; set; } = DateTime.Now;
        public Guid OwnerUserId { get; set; }
        public string MachineName { get; set; } = Environment.MachineName;
        public string EntityType { get; set; }
        public string EntityId { get; set; }
        public string Action { get; set; } // Create, Update, Delete
        public string FieldName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public Guid ChangeGroupId { get; set; }
        public string Hash { get; set; }
        public string PreviousHash { get; set; }
    }
}
