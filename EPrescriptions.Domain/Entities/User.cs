using System;

namespace EPrescriptions.Domain.Entities
{
    public enum UserRole
    {
        Owner,
        Admin,
        Pharmacist,
        Cashier,
        Accountant
    }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; } = true;
        public string PhoneNumber { get; set; }
        public string NationalId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
}
